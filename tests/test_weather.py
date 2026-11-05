"""Tests for weather normalisation (heating degree days)."""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from custom_components.smart_heat_controller.weather import (
    BASE_TEMP,
    DegreeDayTotal,
    TemperatureLedger,
    degree_days,
    heating_degree_days,
    normalised_percent,
    per_degree_day,
)


def test_hdd_is_zero_when_warm():
    assert heating_degree_days(20.0) == 0.0
    assert heating_degree_days(17.0) == 0.0


def test_hdd_uses_base_temperature():
    assert heating_degree_days(7.0) == pytest.approx(BASE_TEMP - 7.0)


def test_hdd_missing_data_is_zero():
    assert heating_degree_days(None) == 0.0


def test_ledger_computes_daily_mean():
    ledger = TemperatureLedger()
    ledger.add(date(2026, 11, 5), 2.0)
    ledger.add(date(2026, 11, 5), 6.0)

    assert ledger.mean(date(2026, 11, 5)) == pytest.approx(4.0)


def test_ledger_mean_missing_day():
    assert TemperatureLedger().mean(date(2026, 11, 5)) is None


def test_degree_days_accumulate_over_a_period():
    ledger = TemperatureLedger()
    start = date(2026, 11, 1)
    for offset in range(3):
        ledger.add(start + timedelta(days=offset), 7.0)

    total = degree_days(ledger, start, start + timedelta(days=2))

    assert total.hdd == pytest.approx(3 * (BASE_TEMP - 7.0))
    assert total.days_with_data == 3
    assert total.usable is True


def test_degree_days_with_no_temperature_data_is_unusable():
    total = degree_days(TemperatureLedger(), date(2026, 11, 1), date(2026, 11, 5))
    assert total.hdd == 0.0
    assert total.usable is False
    assert per_degree_day(10.0, total) is None


def test_specific_consumption():
    total = DegreeDayTotal(hdd=10.0, days_with_data=5, days_in_period=5)
    assert per_degree_day(25.0, total) == pytest.approx(2.5)


def test_normalised_percent():
    assert normalised_percent(2.0, 1.5) == pytest.approx(25.0)
    assert normalised_percent(2.0, 2.5) == pytest.approx(-25.0)
    assert normalised_percent(None, 1.0) is None
    assert normalised_percent(0.0, 1.0) is None


def test_ledger_prune_and_roundtrip():
    ledger = TemperatureLedger()
    ledger.add(date(2026, 1, 1), 1.0)
    ledger.add(date(2026, 11, 1), 5.0)

    restored = TemperatureLedger.from_dict(ledger.as_dict())
    assert restored.mean(date(2026, 11, 1)) == pytest.approx(5.0)

    restored.prune(date(2026, 11, 5), 30)
    assert restored.mean(date(2026, 1, 1)) is None
    assert restored.mean(date(2026, 11, 1)) == pytest.approx(5.0)
