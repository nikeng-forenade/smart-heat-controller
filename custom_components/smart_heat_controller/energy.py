"""Energy accounting primitives for Smart Heat Controller.

Pure Python (no Home Assistant imports) so the tricky parts — counter resets,
daylight saving time, data gaps and unit conversion — are exhaustively unit
testable.

The ledger stores **bounded per-day aggregates**, never raw samples.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta

from .const import (
    QUALITY_ESTIMATED,
    QUALITY_INCOMPLETE,
    QUALITY_MEASURED,
    QUALITY_MISSING,
    SOURCE_HEATPUMP,
    SOURCE_RADIATOR,
    SOURCE_TOTAL,
)

ENERGY_UNITS_TO_KWH: dict[str, float] = {
    "wh": 0.001,
    "kwh": 1.0,
    "mwh": 1000.0,
    "ws": 1.0 / 3_600_000.0,
    "mj": 1.0 / 3.6,
}


def to_kwh(value: float, unit: str | None) -> float:
    """Convert an energy reading to kWh.

    Unknown units are assumed to be kWh; callers should validate the unit
    during config flow, this is a last line of defence.
    """
    if unit is None:
        return value
    return value * ENERGY_UNITS_TO_KWH.get(unit.strip().lower(), 1.0)


# ---------------------------------------------------------------------------
# Cumulative counters
# ---------------------------------------------------------------------------


@dataclass(slots=True)
class CounterUpdate:
    """Result of feeding one reading into a :class:`CounterTracker`."""

    delta_kwh: float | None = None
    reset_detected: bool = False
    gap: bool = False
    first_reading: bool = False


@dataclass(slots=True)
class CounterTracker:
    """Turns a monotonically increasing energy meter into per-reading deltas.

    Handles the three real-world failure modes:

    * ``unknown``/``unavailable`` — reported as ``delta_kwh=None``, and the
      tracker keeps its baseline so nothing is counted twice.
    * counter reset (device reboot, meter replacement) — the new value is
      counted from zero instead of producing a huge negative delta.
    * recorder gaps — the interval is flagged so the day is marked incomplete
      rather than silently under-reporting.
    """

    max_gap: timedelta = timedelta(hours=2)
    last_value: float | None = None
    last_timestamp: datetime | None = None
    reset_count: int = 0
    gap_count: int = 0

    def update(self, now: datetime, value: float | None) -> CounterUpdate:
        if value is None:
            return CounterUpdate()

        if self.last_value is None or self.last_timestamp is None:
            self.last_value = value
            self.last_timestamp = now
            return CounterUpdate(first_reading=True)

        previous_value = self.last_value
        previous_timestamp = self.last_timestamp

        # Always advance the baseline; a gap should not double count later.
        self.last_value = value
        self.last_timestamp = now

        if value < previous_value:
            self.reset_count += 1
            return CounterUpdate(delta_kwh=max(value, 0.0), reset_detected=True)

        delta = value - previous_value
        if now - previous_timestamp > self.max_gap:
            self.gap_count += 1
            return CounterUpdate(gap=True)

        return CounterUpdate(delta_kwh=delta)

    def as_dict(self) -> dict[str, object]:
        return {
            "last_value": self.last_value,
            "last_timestamp": self.last_timestamp.isoformat() if self.last_timestamp else None,
            "reset_count": self.reset_count,
            "gap_count": self.gap_count,
        }

    @classmethod
    def from_dict(cls, data: dict[str, object], max_gap: timedelta) -> CounterTracker:
        timestamp = data.get("last_timestamp")
        return cls(
            max_gap=max_gap,
            last_value=_as_float(data.get("last_value")),
            last_timestamp=datetime.fromisoformat(str(timestamp)) if timestamp else None,
            reset_count=int(data.get("reset_count") or 0),
            gap_count=int(data.get("gap_count") or 0),
        )


# ---------------------------------------------------------------------------
# Fallback: integrate instantaneous power
# ---------------------------------------------------------------------------


@dataclass(slots=True)
class PowerIntegrator:
    """Trapezoidal W -> kWh integration used only when no energy meter exists.

    Data produced here is always labelled *estimated*.
    """

    max_gap: timedelta = timedelta(minutes=15)
    last_watts: float | None = None
    last_timestamp: datetime | None = None

    def update(self, now: datetime, watts: float | None) -> tuple[float, bool]:
        """Return ``(kwh, gap)`` for the interval since the previous reading."""
        if watts is None:
            return 0.0, False

        if self.last_watts is None or self.last_timestamp is None:
            self.last_watts = watts
            self.last_timestamp = now
            return 0.0, False

        elapsed = (now - self.last_timestamp).total_seconds()
        previous_watts = self.last_watts
        self.last_watts = watts
        self.last_timestamp = now

        if elapsed <= 0:
            return 0.0, False
        if elapsed > self.max_gap.total_seconds():
            return 0.0, True

        average_watts = (previous_watts + watts) / 2.0
        return average_watts * elapsed / 3_600_000.0, False

    def as_dict(self) -> dict[str, object]:
        return {
            "last_watts": self.last_watts,
            "last_timestamp": self.last_timestamp.isoformat() if self.last_timestamp else None,
        }

    @classmethod
    def from_dict(cls, data: dict[str, object], max_gap: timedelta) -> PowerIntegrator:
        timestamp = data.get("last_timestamp")
        return cls(
            max_gap=max_gap,
            last_watts=_as_float(data.get("last_watts")),
            last_timestamp=datetime.fromisoformat(str(timestamp)) if timestamp else None,
        )


# ---------------------------------------------------------------------------
# Ledger
# ---------------------------------------------------------------------------


@dataclass(slots=True)
class DayBucket:
    """Aggregated energy for one local calendar day."""

    kwh: float = 0.0
    samples: int = 0
    gaps: int = 0
    complete: bool = True

    def add(self, kwh: float, *, gap: bool = False) -> None:
        self.kwh += kwh
        self.samples += 1
        if gap:
            self.gaps += 1
            self.complete = False

    def as_dict(self) -> dict[str, object]:
        return {
            "kwh": round(self.kwh, 6),
            "samples": self.samples,
            "gaps": self.gaps,
            "complete": self.complete,
        }

    @classmethod
    def from_dict(cls, data: dict[str, object]) -> DayBucket:
        return cls(
            kwh=_as_float(data.get("kwh")) or 0.0,
            samples=int(data.get("samples") or 0),
            gaps=int(data.get("gaps") or 0),
            complete=bool(data.get("complete", True)),
        )


@dataclass(slots=True)
class EnergyTotal:
    """A period total with explicit data quality."""

    kwh: float = 0.0
    days_with_data: int = 0
    days_in_period: int = 0
    incomplete_days: int = 0
    quality: str = QUALITY_MISSING

    @property
    def coverage(self) -> float:
        if self.days_in_period <= 0:
            return 0.0
        return self.days_with_data / self.days_in_period

    def as_dict(self) -> dict[str, object]:
        return {
            "kwh": round(self.kwh, 3),
            "days_with_data": self.days_with_data,
            "days_in_period": self.days_in_period,
            "incomplete_days": self.incomplete_days,
            "coverage": round(self.coverage, 3),
            "quality": self.quality,
        }


@dataclass(slots=True)
class EnergyLedger:
    """Bounded per-day energy aggregates keyed by source and local date."""

    buckets: dict[str, dict[str, DayBucket]] = field(default_factory=dict)

    def add(
        self,
        source: str,
        day: date,
        kwh: float,
        *,
        gap: bool = False,
        estimated: bool = False,
    ) -> DayBucket:
        source_buckets = self.buckets.setdefault(source, {})
        key = day.isoformat()
        bucket = source_buckets.setdefault(key, DayBucket())
        bucket.add(kwh, gap=gap)
        if estimated:
            bucket.complete = bucket.complete  # quality is derived, not stored
        return bucket

    def bucket(self, source: str, day: date) -> DayBucket | None:
        return self.buckets.get(source, {}).get(day.isoformat())

    def prune(self, today: date, keep_days: int) -> None:
        cutoff = (today - timedelta(days=keep_days)).isoformat()
        for source_buckets in self.buckets.values():
            for key in [k for k in source_buckets if k < cutoff]:
                del source_buckets[key]

    def total(
        self,
        source: str,
        start: date,
        end: date,
        *,
        quality: str = QUALITY_MEASURED,
    ) -> EnergyTotal:
        """Sum ``source`` over the inclusive range ``start``..``end``."""
        if end < start:
            return EnergyTotal(quality=QUALITY_MISSING)

        days_in_period = (end - start).days + 1
        total = EnergyTotal(days_in_period=days_in_period, quality=QUALITY_MISSING)
        source_buckets = self.buckets.get(source, {})

        current = start
        while current <= end:
            bucket = source_buckets.get(current.isoformat())
            if bucket is not None and bucket.samples:
                total.kwh += bucket.kwh
                total.days_with_data += 1
                if not bucket.complete:
                    total.incomplete_days += 1
            current += timedelta(days=1)

        if total.days_with_data == 0:
            total.quality = QUALITY_MISSING
        elif total.days_with_data < days_in_period or total.incomplete_days:
            total.quality = QUALITY_INCOMPLETE
        else:
            total.quality = quality
        return total

    def combined_total(self, start: date, end: date) -> EnergyTotal:
        """Sum heat pump + radiator. Incomplete if either source is missing."""
        radiator = self.total(SOURCE_RADIATOR, start, end)
        heatpump = self.total(SOURCE_HEATPUMP, start, end)

        if radiator.quality == QUALITY_MISSING and heatpump.quality == QUALITY_MISSING:
            return EnergyTotal(
                days_in_period=(end - start).days + 1, quality=QUALITY_MISSING
            )

        total = EnergyTotal(
            kwh=radiator.kwh + heatpump.kwh,
            days_with_data=max(radiator.days_with_data, heatpump.days_with_data),
            days_in_period=(end - start).days + 1,
            incomplete_days=max(radiator.incomplete_days, heatpump.incomplete_days),
            quality=QUALITY_MEASURED,
        )
        if (
            radiator.quality != QUALITY_MEASURED
            or heatpump.quality != QUALITY_MEASURED
        ):
            total.quality = QUALITY_INCOMPLETE
        return total

    def series(self, source: str, start: date, end: date) -> list[dict[str, object]]:
        output: list[dict[str, object]] = []
        current = start
        while current <= end:
            bucket = self.bucket(source, current)
            output.append(
                {
                    "date": current.isoformat(),
                    "kwh": round(bucket.kwh, 3) if bucket else None,
                    "complete": bool(bucket and bucket.complete),
                }
            )
            current += timedelta(days=1)
        return output

    def as_dict(self) -> dict[str, dict[str, dict[str, object]]]:
        return {
            source: {key: bucket.as_dict() for key, bucket in buckets.items()}
            for source, buckets in self.buckets.items()
        }

    @classmethod
    def from_dict(cls, data: dict[str, dict[str, dict[str, object]]] | None) -> EnergyLedger:
        ledger = cls()
        if not data:
            return ledger
        for source, buckets in data.items():
            ledger.buckets[source] = {
                key: DayBucket.from_dict(value) for key, value in buckets.items()
            }
        return ledger


# ---------------------------------------------------------------------------
# Period helpers
# ---------------------------------------------------------------------------


def period_today(today: date) -> tuple[date, date]:
    return today, today


def period_week(today: date) -> tuple[date, date]:
    """ISO week (Monday based), matching Home Assistant's week convention."""
    monday = today - timedelta(days=today.weekday())
    return monday, today


def period_month(today: date) -> tuple[date, date]:
    return today.replace(day=1), today


def period_days(today: date, days: int) -> tuple[date, date]:
    return today - timedelta(days=days - 1), today


def is_estimated(source_quality: str) -> bool:
    return source_quality == QUALITY_ESTIMATED


def _as_float(value: object) -> float | None:
    if value is None:
        return None
    try:
        return float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
