"""Weather normalisation via heating degree days.

A before/after kWh comparison is confounded by outdoor temperature: a mild week
always looks like a saving. This module turns daily energy into energy per
heating degree day (kWh/HDD) so two periods can be compared on more equal terms.

The method is deliberately simple and fully disclosed in the UI:

    HDD(day) = max(0, BASE_TEMP - daily_mean_outside_temperature)
    specific = kWh(period) / sum(HDD over the period)

It is an estimate, not a proof of causality. It cannot correct for occupancy,
internal gains, wind, solar gain or thermostat behaviour.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, timedelta

BASE_TEMP = 17.0
# Below this many accumulated degree days the normalisation is meaningless.
MIN_HDD = 5.0


@dataclass(slots=True)
class DayTemperature:
    """Running mean of the outdoor temperature for one local day."""

    total: float = 0.0
    samples: int = 0

    def add(self, value: float) -> None:
        self.total += value
        self.samples += 1

    @property
    def mean(self) -> float | None:
        return self.total / self.samples if self.samples else None

    def as_dict(self) -> dict[str, object]:
        return {"total": round(self.total, 4), "samples": self.samples}

    @classmethod
    def from_dict(cls, data: dict[str, object]) -> DayTemperature:
        return cls(
            total=float(data.get("total") or 0.0),
            samples=int(data.get("samples") or 0),
        )


@dataclass(slots=True)
class TemperatureLedger:
    """Bounded per-day outdoor temperature aggregate."""

    days: dict[str, DayTemperature] = field(default_factory=dict)

    def add(self, day: date, value: float) -> None:
        self.days.setdefault(day.isoformat(), DayTemperature()).add(value)

    def mean(self, day: date) -> float | None:
        entry = self.days.get(day.isoformat())
        return entry.mean if entry else None

    def prune(self, today: date, keep_days: int) -> None:
        cutoff = (today - timedelta(days=keep_days)).isoformat()
        for key in [key for key in self.days if key < cutoff]:
            del self.days[key]

    def as_dict(self) -> dict[str, dict[str, object]]:
        return {key: value.as_dict() for key, value in self.days.items()}

    @classmethod
    def from_dict(
        cls, data: dict[str, dict[str, object]] | None
    ) -> TemperatureLedger:
        ledger = cls()
        if not data:
            return ledger
        ledger.days = {
            key: DayTemperature.from_dict(value) for key, value in data.items()
        }
        return ledger


def heating_degree_days(mean_outside: float | None, base: float = BASE_TEMP) -> float:
    """Degree days for one day; 0 when it is warm enough or data is missing."""
    if mean_outside is None:
        return 0.0
    return max(0.0, base - mean_outside)


@dataclass(frozen=True, slots=True)
class DegreeDayTotal:
    """Accumulated degree days with coverage information."""

    hdd: float = 0.0
    days_with_data: int = 0
    days_in_period: int = 0

    @property
    def usable(self) -> bool:
        return self.hdd >= MIN_HDD and self.days_with_data > 0

    @property
    def coverage(self) -> float:
        if self.days_in_period <= 0:
            return 0.0
        return self.days_with_data / self.days_in_period

    def as_dict(self) -> dict[str, object]:
        return {
            "hdd": round(self.hdd, 2),
            "days_with_data": self.days_with_data,
            "days_in_period": self.days_in_period,
            "coverage": round(self.coverage, 3),
            "usable": self.usable,
        }


def degree_days(
    ledger: TemperatureLedger, start: date, end: date, base: float = BASE_TEMP
) -> DegreeDayTotal:
    """Sum heating degree days over the inclusive range ``start``..``end``."""
    if end < start:
        return DegreeDayTotal()

    total = DegreeDayTotal(days_in_period=(end - start).days + 1)
    current = start
    while current <= end:
        mean = ledger.mean(current)
        if mean is not None:
            total = DegreeDayTotal(
                hdd=total.hdd + heating_degree_days(mean, base),
                days_with_data=total.days_with_data + 1,
                days_in_period=total.days_in_period,
            )
        current += timedelta(days=1)
    return total


def per_degree_day(kwh: float | None, degree_days_total: DegreeDayTotal) -> float | None:
    """Normalised specific consumption, or ``None`` when not meaningful."""
    if kwh is None or not degree_days_total.usable:
        return None
    return kwh / degree_days_total.hdd


def normalised_percent(
    baseline_specific: float | None, comparison_specific: float | None
) -> float | None:
    """Percentage change on a weather-normalised basis."""
    if baseline_specific is None or comparison_specific is None:
        return None
    if baseline_specific <= 0:
        return None
    return 100.0 * (baseline_specific - comparison_specific) / baseline_specific
