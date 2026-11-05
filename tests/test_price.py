"""Tests for the optional electricity price optimiser."""

from __future__ import annotations

import pytest

from custom_components.smart_heat_controller.price import (
    PriceSettings,
    estimate_cost,
    optimise_for_price,
    resolve_price,
)

ENABLED = PriceSettings(
    enabled=True,
    cheap_threshold=0.5,
    expensive_threshold=2.0,
    max_adjust=1.0,
    min_comfort=18.0,
)


def test_disabled_never_adjusts():
    decision = optimise_for_price(
        0.1, PriceSettings(enabled=False), base_target=21.0, presence_home=True
    )
    assert decision.offset == 0.0
    assert decision.state == "disabled"


def test_missing_price_is_reported():
    decision = optimise_for_price(
        None, ENABLED, base_target=21.0, presence_home=True
    )
    assert decision.offset == 0.0
    assert decision.state == "unknown"


def test_cheap_price_preheats_when_home():
    decision = optimise_for_price(
        0.3, ENABLED, base_target=21.0, presence_home=True
    )
    assert decision.offset == pytest.approx(1.0)
    assert decision.state == "cheap"
    assert decision.active is True


def test_cheap_price_does_not_preheat_an_empty_house():
    decision = optimise_for_price(
        0.3, ENABLED, base_target=21.0, presence_home=False
    )
    assert decision.offset == 0.0
    assert decision.reason == "cheap_price_but_nobody_home"


def test_expensive_price_sets_back():
    decision = optimise_for_price(
        3.0, ENABLED, base_target=21.0, presence_home=True
    )
    assert decision.offset == pytest.approx(-1.0)


def test_setback_never_goes_below_comfort_floor():
    settings = PriceSettings(
        enabled=True,
        cheap_threshold=0.5,
        expensive_threshold=2.0,
        max_adjust=5.0,
        min_comfort=19.0,
    )
    decision = optimise_for_price(
        3.0, settings, base_target=21.0, presence_home=True
    )
    assert decision.offset == pytest.approx(-2.0)


def test_setback_blocked_when_already_at_floor():
    settings = PriceSettings(
        enabled=True,
        cheap_threshold=0.5,
        expensive_threshold=2.0,
        max_adjust=1.0,
        min_comfort=21.0,
    )
    decision = optimise_for_price(
        3.0, settings, base_target=21.0, presence_home=True
    )
    assert decision.offset == 0.0
    assert decision.reason == "setback_blocked_by_comfort_floor"


def test_normal_price_range_does_nothing():
    decision = optimise_for_price(
        1.2, ENABLED, base_target=21.0, presence_home=True
    )
    assert decision.offset == 0.0
    assert decision.state == "normal"


def test_missing_thresholds_disable_that_side():
    settings = PriceSettings(enabled=True, cheap_threshold=None, expensive_threshold=None)
    assert optimise_for_price(0.01, settings, base_target=21.0, presence_home=True).offset == 0.0
    assert optimise_for_price(9.99, settings, base_target=21.0, presence_home=True).offset == 0.0


def test_resolve_prefers_all_in_price():
    info = resolve_price(sensor_price=0.8, all_in_price=2.4)
    assert info.sek_per_kwh == pytest.approx(2.4)
    assert info.includes_fees is True


def test_spot_price_is_marked_estimated():
    info = resolve_price(sensor_price=0.8, all_in_price=None)
    assert info.sek_per_kwh == pytest.approx(0.8)
    assert info.includes_fees is False
    assert info.quality == "estimated"


def test_cost_is_none_without_price():
    assert estimate_cost(5.0, resolve_price(sensor_price=None, all_in_price=None)) is None


def test_cost_uses_all_in_price():
    info = resolve_price(sensor_price=None, all_in_price=2.0)
    assert estimate_cost(5.0, info) == pytest.approx(10.0)
