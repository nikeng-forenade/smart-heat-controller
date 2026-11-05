"""Baseline and before/after comparison tests."""

from __future__ import annotations

from datetime import date

import pytest

from custom_components.smart_heat_controller.baseline import (
    BaselinePeriod,
    baseline_ready,
    compare,
    radiator_savings_only,
)
from custom_components.smart_heat_controller.const import (
    QUALITY_INCOMPLETE,
    QUALITY_MISSING,
    SOURCE_HEATPUMP,
    SOURCE_RADIATOR,
    SOURCE_TOTAL,
)
from custom_components.smart_heat_controller.energy import EnergyLedger


def _fill(ledger: EnergyLedger, source: str, start: date, days: int, kwh: float) -> None:
    for offset in range(days):
        ledger.add(source, date.fromordinal(start.toordinal() + offset), kwh)


def test_missing_baseline_yields_no_result():
    ledger = EnergyLedger()
    _fill(ledger, SOURCE_RADIATOR, date(2026, 10, 1), 10, 6.0)

    result = compare(ledger, BaselinePeriod(), date(2026, 10, 20))

    assert result.has_result is False
    assert result.baseline_kwh_per_day is None


def test_radiator_reduction_is_computed_and_labelled():
    ledger = EnergyLedger()
    baseline_start = date(2026, 10, 1)
    _fill(ledger, SOURCE_RADIATOR, baseline_start, 7, 6.0)
    _fill(ledger, SOURCE_RADIATOR, date(2026, 10, 8), 7, 3.6)

    baseline = BaselinePeriod(start=baseline_start, end=date(2026, 10, 7))
    result = compare(ledger, baseline, date(2026, 10, 15))

    assert result.baseline_kwh_per_day == pytest.approx(6.0)
    assert result.comparison_kwh_per_day == pytest.approx(3.6)
    assert result.delta_kwh_per_day == pytest.approx(2.4)
    assert result.percent == pytest.approx(40.0)


def test_negative_savings_are_reported_as_increase():
    ledger = EnergyLedger()
    baseline_start = date(2026, 10, 1)
    _fill(ledger, SOURCE_RADIATOR, baseline_start, 7, 3.0)
    _fill(ledger, SOURCE_RADIATOR, date(2026, 10, 8), 7, 4.5)

    baseline = BaselinePeriod(start=baseline_start, end=date(2026, 10, 7))
    result = compare(ledger, baseline, date(2026, 10, 15))

    assert result.delta_kwh_per_day == pytest.approx(-1.5)
    assert result.is_increase is True
    assert result.percent == pytest.approx(-50.0)


def test_total_source_falls_back_to_radiator_without_heatpump_meter():
    ledger = EnergyLedger()
    baseline_start = date(2026, 10, 1)
    _fill(ledger, SOURCE_RADIATOR, baseline_start, 7, 4.0)
    _fill(ledger, SOURCE_RADIATOR, date(2026, 10, 8), 7, 2.0)

    baseline = BaselinePeriod(start=baseline_start, end=date(2026, 10, 7))
    result = compare(
        ledger, baseline, date(2026, 10, 15),
        source=SOURCE_TOTAL, heatpump_measured=False,
    )

    assert result.source == SOURCE_RADIATOR
    assert result.limited_to_radiator is True


def test_total_source_uses_both_meters_when_available():
    ledger = EnergyLedger()
    baseline_start = date(2026, 10, 1)
    _fill(ledger, SOURCE_RADIATOR, baseline_start, 7, 2.0)
    _fill(ledger, SOURCE_HEATPUMP, baseline_start, 7, 8.0)
    _fill(ledger, SOURCE_RADIATOR, date(2026, 10, 8), 7, 1.0)
    _fill(ledger, SOURCE_HEATPUMP, date(2026, 10, 8), 7, 6.0)

    baseline = BaselinePeriod(start=baseline_start, end=date(2026, 10, 7))
    result = compare(ledger, baseline, date(2026, 10, 15), source=SOURCE_TOTAL)

    assert result.baseline_kwh_per_day == pytest.approx(10.0)
    assert result.comparison_kwh_per_day == pytest.approx(7.0)
    assert result.limited_to_radiator is False


def test_incomplete_comparison_is_flagged():
    ledger = EnergyLedger()
    baseline_start = date(2026, 10, 1)
    _fill(ledger, SOURCE_RADIATOR, baseline_start, 7, 5.0)
    _fill(ledger, SOURCE_RADIATOR, date(2026, 10, 8), 3, 3.0)

    baseline = BaselinePeriod(start=baseline_start, end=date(2026, 10, 7))
    result = compare(ledger, baseline, date(2026, 10, 15))

    assert result.comparison_quality == QUALITY_INCOMPLETE


def test_comparison_requires_enough_time_to_have_passed():
    ledger = EnergyLedger()
    baseline_start = date(2026, 10, 1)
    _fill(ledger, SOURCE_RADIATOR, baseline_start, 7, 5.0)

    baseline = BaselinePeriod(start=baseline_start, end=date(2026, 10, 7))
    result = compare(ledger, baseline, date(2026, 10, 8))

    assert result.has_result is False
    assert result.comparison_quality == QUALITY_MISSING


def test_baseline_readiness_threshold():
    assert baseline_ready(BaselinePeriod(start=date(2026, 10, 1), end=date(2026, 10, 5))) is False
    assert baseline_ready(BaselinePeriod(start=date(2026, 10, 1), end=date(2026, 10, 7))) is True


def test_radiator_only_warning_text():
    assert radiator_savings_only(True) is None
    assert "Radiator savings only" in (radiator_savings_only(False) or "")
