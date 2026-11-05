"""Baseline collection and before/after comparison.

A before/after difference is *not* proof of causal savings, so this module
never hides a negative result and always carries data-quality information.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta

from .const import (
    QUALITY_INCOMPLETE,
    QUALITY_MEASURED,
    QUALITY_MISSING,
    SOURCE_HEATPUMP,
    SOURCE_RADIATOR,
    SOURCE_TOTAL,
)
from .energy import EnergyLedger, EnergyTotal
from .weather import (
    BASE_TEMP,
    TemperatureLedger,
    degree_days,
    normalised_percent,
    per_degree_day,
)

MIN_BASELINE_DAYS = 7
MAX_BASELINE_DAYS = 14


@dataclass(slots=True)
class BaselinePeriod:
    """The user-activated baseline window."""

    start: date | None = None
    end: date | None = None

    @property
    def active(self) -> bool:
        return self.start is not None and self.end is None

    @property
    def recorded(self) -> bool:
        return self.start is not None and self.end is not None

    @property
    def length_days(self) -> int:
        if self.start is None:
            return 0
        end = self.end or self.start
        return (end - self.start).days + 1

    def as_dict(self) -> dict[str, object]:
        return {
            "start": self.start.isoformat() if self.start else None,
            "end": self.end.isoformat() if self.end else None,
            "active": self.active,
            "recorded": self.recorded,
            "length_days": self.length_days,
        }

    @classmethod
    def from_dict(cls, data: dict[str, object] | None) -> BaselinePeriod:
        if not data:
            return cls()
        start = data.get("start")
        end = data.get("end")
        return cls(
            start=date.fromisoformat(str(start)) if start else None,
            end=date.fromisoformat(str(end)) if end else None,
        )


@dataclass(slots=True)
class SavingsResult:
    """Comparison of a comparison window against the recorded baseline."""

    source: str
    baseline_kwh_per_day: float | None = None
    comparison_kwh_per_day: float | None = None
    delta_kwh_per_day: float | None = None
    percent: float | None = None
    baseline_days: int = 0
    comparison_days: int = 0
    baseline_quality: str = QUALITY_MISSING
    comparison_quality: str = QUALITY_MISSING
    baseline_start: date | None = None
    baseline_end: date | None = None
    comparison_start: date | None = None
    comparison_end: date | None = None
    limited_to_radiator: bool = False
    baseline_hdd: float | None = None
    comparison_hdd: float | None = None
    baseline_kwh_per_hdd: float | None = None
    comparison_kwh_per_hdd: float | None = None
    weather_adjusted_percent: float | None = None
    weather_adjustment_available: bool = False

    @property
    def has_result(self) -> bool:
        return self.baseline_kwh_per_day is not None and self.delta_kwh_per_day is not None

    @property
    def is_increase(self) -> bool:
        return bool(self.delta_kwh_per_day is not None and self.delta_kwh_per_day < 0)

    def as_dict(self) -> dict[str, object]:
        return {
            "source": self.source,
            "baseline_kwh_per_day": _round(self.baseline_kwh_per_day),
            "comparison_kwh_per_day": _round(self.comparison_kwh_per_day),
            "delta_kwh_per_day": _round(self.delta_kwh_per_day),
            "percent": _round(self.percent),
            "baseline_days": self.baseline_days,
            "comparison_days": self.comparison_days,
            "baseline_quality": self.baseline_quality,
            "comparison_quality": self.comparison_quality,
            "baseline_start": self.baseline_start.isoformat() if self.baseline_start else None,
            "baseline_end": self.baseline_end.isoformat() if self.baseline_end else None,
            "comparison_start": self.comparison_start.isoformat() if self.comparison_start else None,
            "comparison_end": self.comparison_end.isoformat() if self.comparison_end else None,
            "limited_to_radiator": self.limited_to_radiator,
            "has_result": self.has_result,
            "is_increase": self.is_increase,
            "baseline_hdd": _round(self.baseline_hdd),
            "comparison_hdd": _round(self.comparison_hdd),
            "baseline_kwh_per_hdd": _round(self.baseline_kwh_per_hdd, 3),
            "comparison_kwh_per_hdd": _round(self.comparison_kwh_per_hdd, 3),
            "weather_adjusted_percent": _round(self.weather_adjusted_percent),
            "weather_adjustment_available": self.weather_adjustment_available,
        }


def _round(value: float | None, digits: int = 2) -> float | None:
    return None if value is None else round(value, digits)


def _per_day(total: EnergyTotal) -> float | None:
    if total.days_with_data == 0:
        return None
    return total.kwh / total.days_with_data


def _total_for(
    ledger: EnergyLedger, source: str, start: date, end: date
) -> EnergyTotal:
    if source == SOURCE_TOTAL:
        return ledger.combined_total(start, end)
    return ledger.total(source, start, end)


def compare(
    ledger: EnergyLedger,
    baseline: BaselinePeriod,
    today: date,
    *,
    source: str = SOURCE_RADIATOR,
    heatpump_measured: bool = True,
    temperatures: TemperatureLedger | None = None,
    outside_base: float = BASE_TEMP,
) -> SavingsResult:
    """Compare the most recent baseline-length window against the baseline.

    The comparison window always has the same length as the baseline and ends
    yesterday (a partial current day would bias the average downwards).
    """
    result = SavingsResult(source=source)

    if source == SOURCE_TOTAL:
        if heatpump_measured:
            result.limited_to_radiator = False
        else:
            # Without a heat pump meter the combined view is radiator-only.
            result.limited_to_radiator = True
            source = SOURCE_RADIATOR
            result.source = SOURCE_RADIATOR

    if not baseline.recorded or baseline.start is None or baseline.end is None:
        return result

    baseline_total = _total_for(ledger, source, baseline.start, baseline.end)
    result.baseline_start = baseline.start
    result.baseline_end = baseline.end
    result.baseline_quality = baseline_total.quality
    result.baseline_days = baseline_total.days_with_data

    length = (baseline.end - baseline.start).days + 1
    comparison_end = today - timedelta(days=1)
    comparison_start = comparison_end - timedelta(days=length - 1)

    if comparison_start <= baseline.end:
        # The automation has not run long enough for a fair comparison; the
        # "comparison" window would overlap the baseline itself.
        return result

    comparison_total = _total_for(ledger, source, comparison_start, comparison_end)
    result.comparison_start = comparison_start
    result.comparison_end = comparison_end
    result.comparison_quality = comparison_total.quality
    result.comparison_days = comparison_total.days_with_data

    baseline_per_day = _per_day(baseline_total)
    comparison_per_day = _per_day(comparison_total)
    if baseline_per_day is None or comparison_per_day is None:
        return result

    result.baseline_kwh_per_day = baseline_per_day
    result.comparison_kwh_per_day = comparison_per_day
    result.delta_kwh_per_day = baseline_per_day - comparison_per_day
    if baseline_per_day > 0:
        result.percent = 100.0 * result.delta_kwh_per_day / baseline_per_day

    if (
        baseline_total.quality != QUALITY_MEASURED
        or comparison_total.quality != QUALITY_MEASURED
    ):
        result.baseline_quality = baseline_total.quality or QUALITY_INCOMPLETE
        result.comparison_quality = comparison_total.quality or QUALITY_INCOMPLETE

    if temperatures is not None:
        _apply_weather_normalisation(
            result, temperatures, outside_base, baseline_total, comparison_total
        )

    return result


def _apply_weather_normalisation(
    result: SavingsResult,
    temperatures: TemperatureLedger,
    base: float,
    baseline_total: EnergyTotal,
    comparison_total: EnergyTotal,
) -> None:
    """Add a weather-normalised view without touching the raw comparison."""
    assert result.baseline_start and result.baseline_end  # noqa: S101
    assert result.comparison_start and result.comparison_end  # noqa: S101

    baseline_dd = degree_days(
        temperatures, result.baseline_start, result.baseline_end, base
    )
    comparison_dd = degree_days(
        temperatures, result.comparison_start, result.comparison_end, base
    )

    result.baseline_hdd = baseline_dd.hdd
    result.comparison_hdd = comparison_dd.hdd

    baseline_specific = per_degree_day(baseline_total.kwh, baseline_dd)
    comparison_specific = per_degree_day(comparison_total.kwh, comparison_dd)

    result.baseline_kwh_per_hdd = baseline_specific
    result.comparison_kwh_per_hdd = comparison_specific
    result.weather_adjusted_percent = normalised_percent(
        baseline_specific, comparison_specific
    )
    result.weather_adjustment_available = (
        baseline_specific is not None and comparison_specific is not None
    )


def baseline_ready(baseline: BaselinePeriod) -> bool:
    """Whether a baseline has enough days to be statistically meaningful."""
    return baseline.recorded and baseline.length_days >= MIN_BASELINE_DAYS


def radiator_savings_only(heatpump_measured: bool) -> str | None:
    """Warning string required by the specification when HP is unmeasured."""
    if heatpump_measured:
        return None
    return "Radiator savings only — heat pump electricity not included"
