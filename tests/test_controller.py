"""Unit tests for the pure decision engine."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from custom_components.smart_heat_controller.controller import (
    BackupHeating,
    FallbackRadiator,
    Fault,
    Mode,
    Presence,
    UnknownPresenceBehaviour,
    ZoneConfig,
    ZoneSnapshot,
    ZoneState,
    evaluate,
    update_presence,
)

NOW = datetime(2026, 11, 5, 12, 0, tzinfo=timezone.utc)


def make_snapshot(**kwargs) -> ZoneSnapshot:
    defaults = {
        "now": NOW,
        "room_temperature": 18.0,
        "temperature_updated": NOW,
        "presence": Presence.HOME,
        "heatpump_available": True,
        "radiator_available": True,
        "radiator_is_on": False,
        "heatpump_target": 21.0,
    }
    defaults.update(kwargs)
    return ZoneSnapshot(**defaults)


def test_radiator_turns_on_below_threshold():
    config = ZoneConfig()
    state = ZoneState(selected_mode=Mode.HOME)
    decision, new_state = evaluate(config, make_snapshot(room_temperature=18.5), state)

    assert decision.radiator_on is True
    assert decision.reason == "temperature_below_on_threshold"


def test_hysteresis_band_holds_state():
    config = ZoneConfig()
    state = ZoneState(selected_mode=Mode.HOME, radiator_on=True)

    decision, _ = evaluate(config, make_snapshot(room_temperature=19.5), state)

    assert decision.radiator_on is None
    assert decision.reason == "within_hysteresis_band"


def test_radiator_turns_off_above_threshold():
    config = ZoneConfig()
    state = ZoneState(
        selected_mode=Mode.HOME,
        radiator_on=True,
        radiator_changed_at=NOW - timedelta(minutes=30),
    )

    decision, _ = evaluate(config, make_snapshot(room_temperature=20.4), state)

    assert decision.radiator_on is False


def test_minimum_on_time_blocks_switch_off():
    config = ZoneConfig()
    state = ZoneState(
        selected_mode=Mode.HOME,
        radiator_on=True,
        radiator_changed_at=NOW - timedelta(minutes=2),
    )

    decision, _ = evaluate(config, make_snapshot(room_temperature=22.0), state)

    assert decision.radiator_on is None
    assert decision.reason == "temperature_above_off_threshold_blocked_by_min_runtime"


def test_minimum_off_time_blocks_switch_on():
    config = ZoneConfig()
    state = ZoneState(
        selected_mode=Mode.HOME,
        radiator_on=False,
        radiator_changed_at=NOW - timedelta(minutes=1),
    )

    decision, _ = evaluate(config, make_snapshot(room_temperature=17.0), state)

    assert decision.radiator_on is None
    assert decision.reason == "temperature_below_on_threshold_blocked_by_min_runtime"


def test_safety_temperature_bypasses_minimum_off_time():
    config = ZoneConfig()
    state = ZoneState(
        selected_mode=Mode.AWAY,
        radiator_on=False,
        radiator_changed_at=NOW - timedelta(seconds=10),
    )

    decision, _ = evaluate(config, make_snapshot(room_temperature=15.5), state)

    assert decision.radiator_on is True
    assert decision.reason == "minimum_safety_temperature"


def test_away_mode_turns_radiator_off_and_lowers_target():
    config = ZoneConfig()
    state = ZoneState(selected_mode=Mode.AWAY, radiator_on=True,
                      radiator_changed_at=NOW - timedelta(minutes=60))

    decision, _ = evaluate(config, make_snapshot(room_temperature=19.0, presence=Presence.AWAY), state)

    assert decision.radiator_on is False
    assert decision.heatpump_target == pytest.approx(18.0)


def test_heatpump_target_not_repeated_when_unchanged():
    config = ZoneConfig()
    state = ZoneState(
        selected_mode=Mode.HOME, heatpump_target_command=21.0
    )

    decision, _ = evaluate(config, make_snapshot(), state)

    assert decision.heatpump_target is None


def test_stale_temperature_uses_configured_fallback():
    config = ZoneConfig(fallback_radiator=FallbackRadiator.OFF)
    state = ZoneState(selected_mode=Mode.HOME, radiator_on=True,
                      radiator_changed_at=NOW - timedelta(minutes=60))
    snapshot = make_snapshot(temperature_updated=NOW - timedelta(hours=2))

    decision, _ = evaluate(config, snapshot, state)

    assert Fault.TEMPERATURE_STALE in decision.faults
    assert decision.radiator_on is False
    assert decision.reason == "fallback_temperature_off"
    assert decision.heatpump_target is None


def test_missing_temperature_reports_fault():
    config = ZoneConfig()
    decision, _ = evaluate(
        config, make_snapshot(room_temperature=None, temperature_updated=None), ZoneState()
    )

    assert Fault.TEMPERATURE_MISSING in decision.faults
    assert decision.heatpump_target is None


def test_unavailable_radiator_is_never_commanded():
    config = ZoneConfig()
    decision, _ = evaluate(
        config, make_snapshot(room_temperature=10.0, radiator_available=False),
        ZoneState(selected_mode=Mode.HOME),
    )

    assert decision.radiator_on is None
    assert Fault.RADIATOR_UNAVAILABLE in decision.faults


def test_unavailable_heatpump_can_trigger_backup_heating():
    """Backup heating follows the setpoint instead of running without limit."""
    config = ZoneConfig(backup_heating=BackupHeating.RADIATOR)
    decision, _ = evaluate(
        config, make_snapshot(room_temperature=19.5, heatpump_available=False),
        ZoneState(selected_mode=Mode.HOME),
    )

    assert decision.radiator_on is True
    assert decision.reason == "backup_heating_below_target"
    assert Fault.HEAT_PUMP_UNAVAILABLE in decision.faults


def test_backup_heating_stops_at_the_target():
    """The radiator plug has no thermostat, so it must be stopped at the target."""
    config = ZoneConfig(backup_heating=BackupHeating.RADIATOR)
    decision, _ = evaluate(
        config,
        make_snapshot(room_temperature=21.5, heatpump_available=False),
        ZoneState(selected_mode=Mode.HOME, radiator_on=True),
    )

    assert decision.radiator_on is False
    assert decision.reason == "backup_heating_target_reached"


def test_no_setpoint_is_sent_when_the_heatpump_is_not_heating():
    """An idle pump must not be pushed back into heating by a setpoint."""
    config = ZoneConfig()
    decision, state = evaluate(
        config,
        make_snapshot(
            room_temperature=19.0, heatpump_heating=False, heatpump_target=None
        ),
        ZoneState(selected_mode=Mode.HOME),
    )

    assert decision.heatpump_target is None
    assert state.heatpump_target_command is None


def test_disabled_mode_takes_no_action():
    config = ZoneConfig()
    decision, _ = evaluate(
        config, make_snapshot(), ZoneState(selected_mode=Mode.DISABLED)
    )

    assert decision.radiator_on is None
    assert decision.heatpump_target is None


def test_manual_mode_takes_no_action():
    config = ZoneConfig()
    decision, _ = evaluate(
        config, make_snapshot(), ZoneState(selected_mode=Mode.MANUAL)
    )

    assert decision.reason == "manual_mode_no_action"


def test_boost_expires_back_to_auto():
    config = ZoneConfig()
    state = ZoneState(selected_mode=Mode.BOOST, boost_until=NOW - timedelta(minutes=1))

    decision, new_state = evaluate(config, make_snapshot(), state)

    assert new_state.selected_mode is Mode.AUTO
    assert decision.effective_mode is Mode.HOME


def test_boost_raises_setpoint():
    config = ZoneConfig(boost_offset=2.0)
    state = ZoneState(selected_mode=Mode.BOOST, boost_until=NOW + timedelta(minutes=30))

    decision, _ = evaluate(config, make_snapshot(room_temperature=18.0), state)

    assert decision.heatpump_target == pytest.approx(23.0)


def test_unknown_presence_keeps_last_mode():
    config = ZoneConfig(unknown_presence=UnknownPresenceBehaviour.KEEP_LAST)
    state = ZoneState(last_effective_mode=Mode.HOME, confirmed_presence=Presence.HOME)

    decision, _ = evaluate(config, make_snapshot(presence=Presence.UNKNOWN), state)

    assert decision.effective_mode is Mode.HOME
    assert Fault.PRESENCE_UNKNOWN in decision.faults


def test_presence_debounce_requires_absence_delay():
    state = ZoneState(confirmed_presence=Presence.HOME)

    # Brief WiFi drop: unknown must not flip the state.
    assert (
        update_presence(
            state, Presence.UNKNOWN, NOW, timedelta(minutes=30), timedelta(0)
        )
        is Presence.HOME
    )

    # Away starts a timer but does not confirm immediately.
    assert (
        update_presence(
            state, Presence.AWAY, NOW, timedelta(minutes=30), timedelta(0)
        )
        is Presence.HOME
    )
    assert (
        update_presence(
            state, Presence.AWAY, NOW + timedelta(minutes=10), timedelta(minutes=30),
            timedelta(0),
        )
        is Presence.HOME
    )
    # After the delay the transition is confirmed.
    assert (
        update_presence(
            state, Presence.AWAY, NOW + timedelta(minutes=31), timedelta(minutes=30),
            timedelta(0),
        )
        is Presence.AWAY
    )


def test_unknown_presence_keeps_last_state_by_default():
    """A silent source must not cool the house on its own."""
    state = ZoneState(confirmed_presence=Presence.HOME)

    for minutes in (0, 60, 600):
        assert (
            update_presence(
                state,
                Presence.UNKNOWN,
                NOW + timedelta(minutes=minutes),
                timedelta(minutes=30),
                timedelta(0),
            )
            is Presence.HOME
        )


def test_unknown_presence_becomes_away_when_configured():
    """A phone that never comes back must not heat an empty house forever."""
    state = ZoneState(confirmed_presence=Presence.HOME)

    # Still debounced, so a short dropout changes nothing.
    assert (
        update_presence(
            state,
            Presence.UNKNOWN,
            NOW,
            timedelta(minutes=30),
            timedelta(0),
            UnknownPresenceBehaviour.AWAY,
        )
        is Presence.HOME
    )
    assert (
        update_presence(
            state,
            Presence.UNKNOWN,
            NOW + timedelta(minutes=10),
            timedelta(minutes=30),
            timedelta(0),
            UnknownPresenceBehaviour.AWAY,
        )
        is Presence.HOME
    )
    # After the absence delay the silence counts as absence.
    assert (
        update_presence(
            state,
            Presence.UNKNOWN,
            NOW + timedelta(minutes=31),
            timedelta(minutes=30),
            timedelta(0),
            UnknownPresenceBehaviour.AWAY,
        )
        is Presence.AWAY
    )


def test_away_with_unknown_opt_in_turns_the_radiator_off():
    """The whole point: nobody home means no radiator power."""
    config = ZoneConfig(
        backup_heating=BackupHeating.RADIATOR,
        unknown_presence=UnknownPresenceBehaviour.AWAY,
    )
    state = ZoneState(
        selected_mode=Mode.AUTO, confirmed_presence=Presence.AWAY, radiator_on=True
    )
    decision, _ = evaluate(
        config,
        make_snapshot(
            room_temperature=19.0,
            presence=Presence.AWAY,
            radiator_is_on=True,
            heatpump_available=False,
            heatpump_heating=False,
        ),
        state,
    )

    assert decision.effective_mode is Mode.AWAY
    assert decision.radiator_on is False


def test_arrival_is_confirmed_after_configured_delay():
    state = ZoneState(confirmed_presence=Presence.AWAY)

    assert (
        update_presence(
            state, Presence.HOME, NOW, timedelta(minutes=30), timedelta(minutes=5)
        )
        is Presence.AWAY
    )
    assert (
        update_presence(
            state, Presence.HOME, NOW + timedelta(minutes=6), timedelta(minutes=30),
            timedelta(minutes=5),
        )
        is Presence.HOME
    )


def test_temperature_offset_band_respects_eco_mode():
    config = ZoneConfig(eco_offset=-1.0)
    state = ZoneState(selected_mode=Mode.ECO)

    # ECO widens the band downwards (18.0 / 19.0), so 18.5 is still inside it.
    decision, _ = evaluate(config, make_snapshot(room_temperature=18.5), state)
    assert decision.radiator_on is None

    decision, _ = evaluate(config, make_snapshot(room_temperature=17.9), state)
    assert decision.radiator_on is True
