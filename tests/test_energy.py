"""Unit tests for the energy accounting primitives."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

import pytest

from custom_components.smart_heat_controller.const import (
    QUALITY_INCOMPLETE,
    QUALITY_MEASURED,
    QUALITY_MISSING,
    SOURCE_HEATPUMP,
    SOURCE_RADIATOR,
)
from custom_components.smart_heat_controller.energy import (
    CounterTracker,
    EnergyLedger,
    PowerIntegrator,
    period_month,
    period_today,
    period_week,
    to_kwh,
)

NOW = datetime(2026, 11, 5, 12, 0, tzinfo=timezone.utc)


def test_cumulative_counter_delta_matches_observed_interval():
    """477.2 -> 480.3 kWh is 3.1 kWh over the observed interval only."""
    tracker = CounterTracker()

    first = tracker.update(NOW, 477.2)
    assert first.delta_kwh is None
    assert first.first_reading is True

    second = tracker.update(NOW + timedelta(hours=1), 480.3)
    assert second.delta_kwh == pytest.approx(3.1)


def test_counter_detects_reset():
    tracker = CounterTracker()
    tracker.update(NOW, 480.3)
    update = tracker.update(NOW + timedelta(minutes=30), 0.4)

    assert update.reset_detected is True
    assert update.delta_kwh == pytest.approx(0.4)
    assert tracker.reset_count == 1


def test_counter_ignores_unavailable_value():
    tracker = CounterTracker()
    tracker.update(NOW, 100.0)
    update = tracker.update(NOW + timedelta(minutes=5), None)

    assert update.delta_kwh is None
    assert tracker.last_value == 100.0

    # The next valid reading still measures from the original baseline.
    update = tracker.update(NOW + timedelta(minutes=10), 101.0)
    assert update.delta_kwh == pytest.approx(1.0)


def test_counter_marks_gap_without_false_consumption():
    tracker = CounterTracker(max_gap=timedelta(hours=1))
    tracker.update(NOW, 10.0)
    update = tracker.update(NOW + timedelta(hours=5), 14.0)

    assert update.gap is True
    assert update.delta_kwh is None
    assert tracker.gap_count == 1

    # After a gap the baseline moves forward so nothing is double counted.
    update = tracker.update(NOW + timedelta(hours=5, minutes=10), 15.0)
    assert update.delta_kwh == pytest.approx(1.0)


def test_counter_roundtrip_serialisation():
    tracker = CounterTracker()
    tracker.update(NOW, 12.5)
    restored = CounterTracker.from_dict(tracker.as_dict(), timedelta(hours=2))

    assert restored.last_value == pytest.approx(12.5)
    assert restored.last_timestamp == NOW


@pytest.mark.parametrize(
    ("value", "unit", "expected"),
    [(1000.0, "Wh", 1.0), (1.0, "kWh", 1.0), (1.0, "MWh", 1000.0), (5.0, None, 5.0)],
)
def test_unit_conversion(value, unit, expected):
    assert to_kwh(value, unit) == pytest.approx(expected)


def test_power_integrator_estimates_energy():
    integrator = PowerIntegrator()
    integrator.update(NOW, 800.0)
    kwh, gap = integrator.update(NOW + timedelta(minutes=10), 800.0)

    assert gap is False
    assert kwh == pytest.approx(800 * 600 / 3_600_000, rel=1e-3)


def test_power_integrator_flags_large_gap():
    integrator = PowerIntegrator()
    integrator.update(NOW, 800.0)
    kwh, gap = integrator.update(NOW + timedelta(hours=3), 800.0)

    assert gap is True
    assert kwh == 0.0


def test_ledger_totals_and_quality():
    ledger = EnergyLedger()
    ledger.add(SOURCE_RADIATOR, date(2026, 11, 1), 2.0)
    ledger.add(SOURCE_RADIATOR, date(2026, 11, 2), 3.0)

    total = ledger.total(SOURCE_RADIATOR, date(2026, 11, 1), date(2026, 11, 2))
    assert total.kwh == pytest.approx(5.0)
    assert total.quality == QUALITY_MEASURED

    partial = ledger.total(SOURCE_RADIATOR, date(2026, 11, 1), date(2026, 11, 3))
    assert partial.quality == QUALITY_INCOMPLETE
    assert partial.coverage == pytest.approx(2 / 3, rel=1e-3)


def test_ledger_missing_source_is_not_zero():
    ledger = EnergyLedger()
    total = ledger.total(SOURCE_HEATPUMP, date(2026, 11, 1), date(2026, 11, 2))

    assert total.quality == QUALITY_MISSING
    assert total.kwh == 0.0


def test_combined_total_is_incomplete_when_heatpump_missing():
    ledger = EnergyLedger()
    ledger.add(SOURCE_RADIATOR, date(2026, 11, 1), 2.0)

    combined = ledger.combined_total(date(2026, 11, 1), date(2026, 11, 1))

    assert combined.kwh == pytest.approx(2.0)
    assert combined.quality == QUALITY_INCOMPLETE


def test_ledger_gap_marks_day_incomplete():
    ledger = EnergyLedger()
    ledger.add(SOURCE_RADIATOR, date(2026, 11, 1), 1.0, gap=True)

    total = ledger.total(SOURCE_RADIATOR, date(2026, 11, 1), date(2026, 11, 1))
    assert total.quality == QUALITY_INCOMPLETE


def test_ledger_roundtrip():
    ledger = EnergyLedger()
    ledger.add(SOURCE_RADIATOR, date(2026, 11, 1), 2.5)
    ledger.add(SOURCE_HEATPUMP, date(2026, 11, 1), 7.5)

    restored = EnergyLedger.from_dict(ledger.as_dict())
    assert restored.total(SOURCE_RADIATOR, date(2026, 11, 1), date(2026, 11, 1)).kwh == pytest.approx(2.5)
    assert restored.total(SOURCE_HEATPUMP, date(2026, 11, 1), date(2026, 11, 1)).kwh == pytest.approx(7.5)


def test_ledger_prune_keeps_recent_days():
    ledger = EnergyLedger()
    ledger.add(SOURCE_RADIATOR, date(2026, 1, 1), 1.0)
    ledger.add(SOURCE_RADIATOR, date(2026, 11, 1), 2.0)

    ledger.prune(date(2026, 11, 5), 30)

    assert ledger.bucket(SOURCE_RADIATOR, date(2026, 1, 1)) is None
    assert ledger.bucket(SOURCE_RADIATOR, date(2026, 11, 1)) is not None


def test_period_helpers():
    today = date(2026, 11, 5)  # Thursday
    assert period_today(today) == (today, today)
    assert period_week(today) == (date(2026, 11, 2), today)
    assert period_month(today) == (date(2026, 11, 1), today)


def test_midnight_boundary_splits_days():
    """Energy must land on the local day of the reading, not the previous one."""
    ledger = EnergyLedger()
    tracker = CounterTracker()

    tracker.update(datetime(2026, 11, 5, 23, 50, tzinfo=timezone.utc), 10.0)
    update = tracker.update(datetime(2026, 11, 6, 0, 10, tzinfo=timezone.utc), 10.2)
    ledger.add(SOURCE_RADIATOR, date(2026, 11, 6), update.delta_kwh or 0.0)

    assert ledger.bucket(SOURCE_RADIATOR, date(2026, 11, 5)) is None
    assert ledger.bucket(SOURCE_RADIATOR, date(2026, 11, 6)).kwh == pytest.approx(0.2)


def test_series_fills_missing_days_with_none():
    ledger = EnergyLedger()
    ledger.add(SOURCE_RADIATOR, date(2026, 11, 1), 1.0)

    series = ledger.series(SOURCE_RADIATOR, date(2026, 11, 1), date(2026, 11, 3))

    assert [row["kwh"] for row in series] == [1.0, None, None]
