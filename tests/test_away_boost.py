"""Unit tests for the away boost and the dashboard's power approximation."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from custom_components.smart_heat_controller.controller import (
    Presence,
    ZoneConfig,
    ZoneSnapshot,
    ZoneState,
    away_boost_target,
    evaluate,
)
from custom_components.smart_heat_controller.energy import PowerFromEnergy

NOW = datetime(2026, 11, 5, 12, 0, tzinfo=timezone.utc)

BOOST = ZoneConfig(
    away_boost=True, away_boost_start_below=17.0, away_boost_stop_at=18.0
)


def _snapshot(temperature: float | None, presence: Presence = Presence.AWAY, **kwargs) -> ZoneSnapshot:
    defaults = {
        "now": NOW,
        "room_temperature": temperature,
        "temperature_updated": NOW if temperature is not None else None,
        "presence": presence,
        "heatpump_available": True,
        "radiator_available": True,
        "radiator_is_on": False,
        "heatpump_target": 18.0,
    }
    defaults.update(kwargs)
    return ZoneSnapshot(**defaults)


# ---------------------------------------------------------------------------
# Away boost
# ---------------------------------------------------------------------------


def test_boost_starts_below_start_and_targets_above_stop() -> None:
    decision, state = evaluate(BOOST, _snapshot(16.5), ZoneState())

    assert decision.away_boost is True
    assert state.away_boost_active is True
    # One degree above the stop temperature so the pump does not throttle early.
    assert decision.heatpump_target == pytest.approx(19.0)
    assert away_boost_target(BOOST) == pytest.approx(19.0)
    # The radiator is not switched on: the pump carries the load.
    assert decision.radiator_on is None


def test_boost_runs_through_the_band_and_stops_at_stop() -> None:
    _, state = evaluate(BOOST, _snapshot(16.5), ZoneState())

    decision, state = evaluate(BOOST, _snapshot(17.5), state)
    assert decision.away_boost is True

    decision, state = evaluate(BOOST, _snapshot(18.0), state)
    assert decision.away_boost is False
    assert state.away_boost_active is False
    assert decision.heatpump_target == pytest.approx(BOOST.away_target)

    # Cooling back into the band does not restart it; only below start does.
    decision, state = evaluate(BOOST, _snapshot(17.5), state)
    assert decision.away_boost is False

    decision, state = evaluate(BOOST, _snapshot(16.9), state)
    assert decision.away_boost is True


def test_boost_is_not_in_play_when_disabled_or_home() -> None:
    decision, _ = evaluate(ZoneConfig(), _snapshot(16.5), ZoneState())
    assert decision.away_boost is None

    decision, state = evaluate(
        BOOST,
        _snapshot(16.5, presence=Presence.HOME),
        ZoneState(away_boost_active=True),
    )
    assert decision.away_boost is None
    assert state.away_boost_active is False


def test_boost_holds_its_phase_without_a_usable_temperature() -> None:
    decision, state = evaluate(
        BOOST, _snapshot(None), ZoneState(away_boost_active=True)
    )
    assert decision.away_boost is True
    assert state.away_boost_active is True


def test_safety_temperature_still_switches_the_radiator_on() -> None:
    decision, _ = evaluate(BOOST, _snapshot(15.5), ZoneState())
    assert decision.away_boost is True
    assert decision.radiator_on is True
    assert decision.reason == "minimum_safety_temperature"


def test_boost_state_round_trips() -> None:
    state = ZoneState(away_boost_active=True, away_fan_restore="3")
    restored = ZoneState.from_dict(state.as_dict())
    assert restored.away_boost_active is True
    assert restored.away_fan_restore == "3"


# ---------------------------------------------------------------------------
# Power from an energy meter
# ---------------------------------------------------------------------------


def test_power_from_energy_averages_the_meter() -> None:
    rate = PowerFromEnergy()
    rate.update(NOW, 480.0)
    assert rate.watts(NOW + timedelta(minutes=2)) is None  # too short to tell

    rate.update(NOW + timedelta(minutes=10), 480.1)
    rate.update(NOW + timedelta(minutes=20), 480.2)
    # 0.2 kWh in 20 minutes = 600 W.
    assert rate.watts(NOW + timedelta(minutes=20)) == pytest.approx(600.0)


def test_power_from_energy_forgets_samples_outside_the_window() -> None:
    rate = PowerFromEnergy(window=timedelta(minutes=30))
    rate.update(NOW, 100.0)
    rate.update(NOW + timedelta(minutes=30), 101.0)
    rate.update(NOW + timedelta(minutes=60), 101.0)
    # The pump stopped: the last half hour used nothing.
    assert rate.watts(NOW + timedelta(minutes=60)) == pytest.approx(0.0)


def test_power_from_energy_restarts_after_a_counter_reset() -> None:
    rate = PowerFromEnergy()
    rate.update(NOW, 480.0)
    rate.update(NOW + timedelta(minutes=10), 0.2)
    assert rate.samples == [(NOW + timedelta(minutes=10), 0.2)]
    assert rate.watts(NOW + timedelta(minutes=12)) is None
