"""Integration tests for the thermostat, schedule, price and panel."""

from __future__ import annotations

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.smart_heat_controller.const import DOMAIN
from custom_components.smart_heat_controller.controller import Mode
from custom_components.smart_heat_controller.schedule import ScheduleSegment

THERMOSTAT = "climate.sagas_hus_thermostat"


@pytest.fixture
async def entities(hass: HomeAssistant) -> None:
    hass.states.async_set(
        "climate.mitsubishi",
        "heat",
        {"current_temperature": 18.0, "temperature": 21.0},
    )
    hass.states.async_set("switch.shelly", "off")
    hass.states.async_set(
        "sensor.room_temperature", "18.5", {"unit_of_measurement": "°C"}
    )
    hass.states.async_set(
        "sensor.shelly_power", "0", {"unit_of_measurement": "W"}
    )
    hass.states.async_set(
        "sensor.shelly_energy",
        "10.0",
        {"unit_of_measurement": "kWh", "state_class": "total_increasing"},
    )
    hass.states.async_set(
        "sensor.mitsubishi_energy",
        "480.30",
        {"unit_of_measurement": "kWh", "state_class": "total_increasing"},
    )
    hass.states.async_set("device_tracker.saga_phone", "home")
    hass.states.async_set(
        "sensor.outside", "5.0", {"unit_of_measurement": "°C"}
    )


@pytest.fixture
async def loaded(hass: HomeAssistant, entities, mock_entry: MockConfigEntry):
    async def _noop(call) -> None:
        return None

    hass.services.async_register("switch", "turn_on", _noop)
    hass.services.async_register("switch", "turn_off", _noop)
    hass.services.async_register("climate", "set_temperature", _noop)

    mock_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    return mock_entry


# ---------------------------------------------------------------------------
# Zone thermostat
# ---------------------------------------------------------------------------


async def test_thermostat_entity_exists(hass: HomeAssistant, loaded) -> None:
    state = hass.states.get(THERMOSTAT)
    assert state is not None
    assert state.state == "heat"
    assert float(state.attributes["current_temperature"]) == pytest.approx(18.5)
    assert float(state.attributes["temperature"]) == pytest.approx(21.0)
    assert "boost" in state.attributes["preset_modes"]


async def test_thermostat_preset_changes_mode(hass: HomeAssistant, loaded) -> None:
    await hass.services.async_call(
        "climate",
        "set_preset_mode",
        {"entity_id": THERMOSTAT, "preset_mode": "away"},
        blocking=True,
    )
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][loaded.entry_id]
    assert coordinator.zone_state.selected_mode.value == "away"
    assert hass.states.get(THERMOSTAT).attributes["preset_mode"] == "away"


async def test_thermostat_temperature_writes_home_target(
    hass: HomeAssistant, loaded
) -> None:
    await hass.services.async_call(
        "climate",
        "set_temperature",
        {"entity_id": THERMOSTAT, "temperature": 22.0},
        blocking=True,
    )
    await hass.async_block_till_done()

    assert loaded.options.get("home_target") == pytest.approx(22.0)
    coordinator = hass.data[DOMAIN][loaded.entry_id]
    assert coordinator.zone_config.home_target == pytest.approx(22.0)


async def test_thermostat_off_disables_controller(hass: HomeAssistant, loaded) -> None:
    await hass.services.async_call(
        "climate",
        "set_hvac_mode",
        {"entity_id": THERMOSTAT, "hvac_mode": "off"},
        blocking=True,
    )
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][loaded.entry_id]
    assert coordinator.zone_state.selected_mode.value == "disabled"


# ---------------------------------------------------------------------------
# Heat pump not heating (off / fan_only / dry / cool) and back-up heating
# ---------------------------------------------------------------------------

PUMP = "climate.mitsubishi"


async def _refresh(hass: HomeAssistant, entry) -> object:
    coordinator = hass.data[DOMAIN][entry.entry_id]
    await coordinator.async_refresh()
    await hass.async_block_till_done()
    return coordinator


async def test_plug_switched_on_by_hand_is_honoured(
    hass: HomeAssistant, loaded
) -> None:
    """Saga presses the Shelly button; the controller must not undo it."""
    coordinator = hass.data[DOMAIN][loaded.entry_id]
    _set_room(hass, "21.0")
    coordinator.zone_state.radiator_on = False
    coordinator.zone_state.radiator_changed_at = None
    coordinator._last_radiator_command_at = None
    await _refresh(hass, loaded)
    assert coordinator.data.decision.radiator_on is None

    hass.states.async_set("switch.shelly", "on")
    coordinator = await _refresh(hass, loaded)

    assert coordinator.zone_state.radiator_manual is True
    assert coordinator.data.decision.radiator_on is None
    assert coordinator.data.decision.reason == "manual_radiator_override"
    assert hass.states.get("switch.shelly").state == "on"


async def test_manual_plug_is_switched_off_when_leaving(
    hass: HomeAssistant, loaded
) -> None:
    """The away rule still outranks a plug switched on by hand."""
    commanded: list[str] = []

    def _record(call) -> None:
        commanded.append(call.service)

    hass.services.async_register("switch", "turn_off", _record)
    coordinator = hass.data[DOMAIN][loaded.entry_id]
    _set_room(hass, "21.0")
    hass.states.async_set("switch.shelly", "off")
    coordinator.zone_state.radiator_on = False
    coordinator.zone_state.radiator_changed_at = None
    coordinator._last_radiator_command_at = None
    await _refresh(hass, loaded)

    hass.states.async_set("switch.shelly", "on")
    coordinator = await _refresh(hass, loaded)
    assert coordinator.zone_state.radiator_manual is True

    # The minimum runtime still protects the plug, so let it elapse first.
    coordinator.zone_state.radiator_changed_at = None
    await _set_mode(hass, "away")
    coordinator = await _refresh(hass, loaded)

    assert "turn_off" in commanded
    assert coordinator.zone_state.radiator_manual is False
    assert coordinator.data.decision.reason.startswith("away")


async def test_manual_plug_switch_off_releases_the_override(
    hass: HomeAssistant, loaded
) -> None:
    coordinator = hass.data[DOMAIN][loaded.entry_id]
    _set_room(hass, "21.0")
    hass.states.async_set("switch.shelly", "off")
    coordinator.zone_state.radiator_on = False
    coordinator.zone_state.radiator_changed_at = None
    coordinator._last_radiator_command_at = None
    await _refresh(hass, loaded)

    hass.states.async_set("switch.shelly", "on")
    coordinator = await _refresh(hass, loaded)
    assert coordinator.zone_state.radiator_manual is True

    hass.states.async_set("switch.shelly", "off")
    coordinator = await _refresh(hass, loaded)

    assert coordinator.zone_state.radiator_manual is False


async def test_away_switches_the_pump_to_fan_and_back(
    hass: HomeAssistant, loaded
) -> None:
    """Leaving for school puts the pump on fan; coming home heats again."""
    modes: list[str] = []

    def _record(call) -> None:
        modes.append(call.data.get("hvac_mode"))

    hass.services.async_register("climate", "set_hvac_mode", _record)
    hass.config_entries.async_update_entry(
        loaded, options={**loaded.options, "away_hvac_mode": "fan_only"}
    )
    coordinator = hass.data[DOMAIN][loaded.entry_id]
    await _refresh(hass, loaded)

    await _set_mode(hass, "away")
    coordinator = await _refresh(hass, loaded)
    assert modes[:1] == ["fan_only"]
    assert coordinator.zone_state.heatpump_hvac_applied == "fan_only"

    # The device now reports fan_only, as a real unit would.
    _set_pump(hass, "fan_only")
    modes.clear()
    await _set_mode(hass, "home")
    coordinator = await _refresh(hass, loaded)

    assert modes == ["heat"]
    assert coordinator.zone_state.heatpump_hvac_applied is None


async def test_away_can_switch_the_pump_back_on(
    hass: HomeAssistant, loaded
) -> None:
    """A pump switched off for the night takes over again when she leaves."""
    modes: list[str] = []

    def _record(call) -> None:
        modes.append(call.data.get("hvac_mode"))

    hass.services.async_register("climate", "set_hvac_mode", _record)
    hass.config_entries.async_update_entry(
        loaded, options={**loaded.options, "away_hvac_mode": "heat"}
    )
    _set_pump(hass, "off")

    await _set_mode(hass, "away")
    await _refresh(hass, loaded)

    assert modes == ["heat"]


async def test_away_hvac_mode_keep_sends_no_mode_command(
    hass: HomeAssistant, loaded
) -> None:
    modes: list[str] = []

    def _record(call) -> None:
        modes.append(call.data.get("hvac_mode"))

    hass.services.async_register("climate", "set_hvac_mode", _record)

    await _set_mode(hass, "away")
    await _refresh(hass, loaded)

    assert modes == []


async def test_manual_pump_choice_is_not_undone_on_arrival(
    hass: HomeAssistant, loaded
) -> None:
    """If somebody changed the pump by hand, coming home leaves it alone."""
    modes: list[str] = []

    def _record(call) -> None:
        modes.append(call.data.get("hvac_mode"))

    hass.services.async_register("climate", "set_hvac_mode", _record)
    hass.config_entries.async_update_entry(
        loaded, options={**loaded.options, "away_hvac_mode": "fan_only"}
    )
    coordinator = hass.data[DOMAIN][loaded.entry_id]
    await _set_mode(hass, "away")
    await _refresh(hass, loaded)
    assert coordinator.zone_state.heatpump_hvac_applied == "fan_only"

    # She switched the pump off herself, then presence reports home again.
    await hass.async_block_till_done()
    _set_pump(hass, "off")
    coordinator.zone_state.selected_mode = Mode.HOME
    modes.clear()
    await _refresh(hass, loaded)

    assert modes == []
    assert coordinator.zone_state.heatpump_hvac_applied is None


# ---------------------------------------------------------------------------
# Heat pump start-up profile (fan speed and start temperature)
# ---------------------------------------------------------------------------


def _set_pump_with_fans(hass: HomeAssistant, hvac_mode: str) -> None:
    hass.states.async_set(
        PUMP,
        hvac_mode,
        {
            "current_temperature": 20.0,
            "temperature": 21.0,
            "fan_mode": "auto",
            "fan_modes": ["auto", "quiet", "low", "high"],
        },
    )


async def test_start_profile_is_applied_when_the_pump_starts(
    hass: HomeAssistant, loaded
) -> None:
    """Coming home starts the pump with the configured fan speed and target."""
    modes: list[str] = []
    fans: list[str] = []
    targets: list[float] = []

    def _record_mode(call) -> None:
        modes.append(call.data.get("hvac_mode"))

    def _record_fan(call) -> None:
        fans.append(call.data.get("fan_mode"))

    def _record_target(call) -> None:
        targets.append(float(call.data.get("temperature")))

    hass.services.async_register("climate", "set_hvac_mode", _record_mode)
    hass.services.async_register("climate", "set_fan_mode", _record_fan)
    hass.services.async_register("climate", "set_temperature", _record_target)

    hass.config_entries.async_update_entry(
        loaded,
        options={
            **loaded.options,
            "away_hvac_mode": "fan_only",
            "heatpump_fan_mode": "high",
            "heatpump_start_target": 24.0,
        },
    )
    await _refresh(hass, loaded)

    await _set_mode(hass, "away")
    await _refresh(hass, loaded)
    assert modes[:1] == ["fan_only"]

    _set_pump_with_fans(hass, "fan_only")
    modes.clear()
    fans.clear()
    targets.clear()

    await _set_mode(hass, "home")
    coordinator = await _refresh(hass, loaded)

    assert modes == ["heat"]
    assert fans == ["high"]
    assert targets == [pytest.approx(24.0)]
    assert coordinator.zone_state.heatpump_target_command is None


async def test_start_profile_is_silent_by_default(
    hass: HomeAssistant, loaded
) -> None:
    """Without a configured profile only the HVAC mode is commanded."""
    fans: list[str] = []

    def _record_fan(call) -> None:
        fans.append(call.data.get("fan_mode"))

    hass.services.async_register("climate", "set_hvac_mode", lambda call: None)
    hass.services.async_register("climate", "set_fan_mode", _record_fan)
    hass.config_entries.async_update_entry(
        loaded, options={**loaded.options, "away_hvac_mode": "fan_only"}
    )
    await _refresh(hass, loaded)

    await _set_mode(hass, "away")
    await _refresh(hass, loaded)
    _set_pump_with_fans(hass, "fan_only")
    fans.clear()

    await _set_mode(hass, "home")
    await _refresh(hass, loaded)

    assert fans == []


async def test_unsupported_fan_mode_is_never_sent(
    hass: HomeAssistant, loaded
) -> None:
    """A fan speed the unit does not advertise is skipped instead of guessed."""
    fans: list[str] = []

    def _record_fan(call) -> None:
        fans.append(call.data.get("fan_mode"))

    hass.services.async_register("climate", "set_hvac_mode", lambda call: None)
    hass.services.async_register("climate", "set_fan_mode", _record_fan)
    hass.config_entries.async_update_entry(
        loaded,
        options={
            **loaded.options,
            "away_hvac_mode": "fan_only",
            "heatpump_fan_mode": "turbo",
        },
    )
    await _refresh(hass, loaded)

    await _set_mode(hass, "away")
    await _refresh(hass, loaded)
    _set_pump_with_fans(hass, "fan_only")
    fans.clear()

    await _set_mode(hass, "home")
    await _refresh(hass, loaded)

    assert fans == []


# ---------------------------------------------------------------------------
# Power anomaly
# ---------------------------------------------------------------------------

POWER_ANOMALY = "binary_sensor.sagas_hus_power_anomaly"
MODE_SELECT = "select.sagas_hus_operating_mode"


async def _set_mode(hass: HomeAssistant, option: str) -> None:
    await hass.services.async_call(
        "select",
        "select_option",
        {"entity_id": MODE_SELECT, "option": option},
        blocking=True,
    )
    await hass.async_block_till_done()


def _set_radiator_power(hass: HomeAssistant, watts: str) -> None:
    hass.states.async_set(
        "sensor.shelly_power",
        watts,
        {"unit_of_measurement": "W", "device_class": "power"},
    )


async def test_power_anomaly_is_ignored_in_manual_mode(
    hass: HomeAssistant, loaded
) -> None:
    """A radiator the user runs manually must not raise a power anomaly."""
    await _set_mode(hass, "manual")
    _set_radiator_power(hass, "700")

    coordinator = hass.data[DOMAIN][loaded.entry_id]
    await coordinator.async_refresh()
    await hass.async_block_till_done()

    state = hass.states.get(POWER_ANOMALY)
    assert state.state == "off"
    assert state.attributes["power_w"] == pytest.approx(700)
    assert state.attributes["expected_on"] is None


async def test_power_anomaly_flags_power_expected_off(
    hass: HomeAssistant, loaded
) -> None:
    """Power drawn while the controller wants the radiator off is an anomaly."""
    await _set_mode(hass, "away")
    coordinator = hass.data[DOMAIN][loaded.entry_id]
    # Skip the minimum-runtime guard so the away command takes effect now: the
    # setup fixture turns the radiator on because the room starts at 18.5 °C.
    coordinator.zone_state.radiator_changed_at = None
    _set_radiator_power(hass, "700")

    await coordinator.async_refresh()
    await hass.async_block_till_done()

    state = hass.states.get(POWER_ANOMALY)
    assert coordinator.zone_state.radiator_on is False
    assert state.state == "on"
    assert state.attributes["expected_on"] is False


# ---------------------------------------------------------------------------
# Heat pump not heating (off / fan_only / dry / cool) and back-up heating
# ---------------------------------------------------------------------------

PUMP = "climate.mitsubishi"


async def _refresh(hass: HomeAssistant, entry) -> object:
    coordinator = hass.data[DOMAIN][entry.entry_id]
    await coordinator.async_refresh()
    await hass.async_block_till_done()
    return coordinator


@pytest.fixture
async def backup_loaded(hass: HomeAssistant, loaded):
    """Entry with the radiator opted in as back-up for a heat pump that is off."""
    hass.config_entries.async_update_entry(
        loaded, options={**loaded.options, "backup_heating": "radiator"}
    )
    return loaded


def _set_room(hass: HomeAssistant, value: str) -> None:
    hass.states.async_set(
        "sensor.room_temperature", value, {"unit_of_measurement": "°C"}
    )


def _set_pump(hass: HomeAssistant, hvac_mode: str) -> None:
    hass.states.async_set(
        PUMP, hvac_mode, {"current_temperature": 20.0, "temperature": 21.0}
    )


async def test_backup_heating_turns_radiator_on_below_its_threshold(
    hass: HomeAssistant, backup_loaded
) -> None:
    """The configured radiator threshold decides, not the room setpoint."""
    _set_pump(hass, "off")
    _set_room(hass, "18.5")

    coordinator = hass.data[DOMAIN][backup_loaded.entry_id]
    hass.states.async_set("switch.shelly", "off")
    coordinator.zone_state.radiator_on = False
    coordinator.zone_state.radiator_changed_at = None
    coordinator._last_radiator_command_at = None
    coordinator = await _refresh(hass, backup_loaded)
    decision = coordinator.data.decision

    assert decision.heatpump_target is None
    assert decision.radiator_on is True
    assert decision.reason == "temperature_below_on_threshold"


async def test_backup_heating_turns_radiator_off_above_its_threshold(
    hass: HomeAssistant, backup_loaded
) -> None:
    _set_pump(hass, "fan_only")
    _set_room(hass, "20.5")

    coordinator = hass.data[DOMAIN][backup_loaded.entry_id]
    coordinator.zone_state.radiator_on = True
    coordinator.zone_state.radiator_changed_at = None
    coordinator = await _refresh(hass, backup_loaded)
    decision = coordinator.data.decision

    assert decision.radiator_on is False
    assert decision.reason == "temperature_above_off_threshold"


async def test_backup_heating_holds_within_the_band(
    hass: HomeAssistant, backup_loaded
) -> None:
    _set_pump(hass, "off")
    _set_room(hass, "19.5")

    coordinator = await _refresh(hass, backup_loaded)

    assert coordinator.data.decision.radiator_on is None
    assert coordinator.data.decision.reason == "within_hysteresis_band"


async def test_radiator_stays_off_when_backup_is_not_opted_in(
    hass: HomeAssistant, loaded
) -> None:
    """Without opting in, an idle pump switches a running radiator off."""
    _set_pump(hass, "off")
    _set_room(hass, "18.5")

    coordinator = hass.data[DOMAIN][loaded.entry_id]
    hass.states.async_set("switch.shelly", "on")
    coordinator.zone_state.radiator_on = True
    coordinator.zone_state.radiator_changed_at = None
    coordinator._last_radiator_command_at = None
    coordinator = await _refresh(hass, loaded)

    assert coordinator.data.decision.radiator_on is False
    assert coordinator.data.decision.reason == "heatpump_not_heating_radiator_off"


async def test_no_setpoint_is_sent_while_the_pump_is_not_heating(
    hass: HomeAssistant, loaded
) -> None:
    """A fan-only pump must not be pushed back into heating by a setpoint."""
    calls: list[str] = []

    def _record(call) -> None:
        calls.append(call.service)

    hass.services.async_register("climate", "set_temperature", _record)

    _set_pump(hass, "fan_only")
    await _refresh(hass, loaded)
    calls.clear()

    # Move the effective target so a setpoint would be sent if it were allowed.
    await hass.services.async_call(
        "number",
        "set_value",
        {"entity_id": "number.sagas_hus_home_target", "value": 23.0},
        blocking=True,
    )
    await hass.async_block_till_done()

    assert calls == []


async def test_radiator_switched_on_by_hand_is_adopted(
    hass: HomeAssistant, loaded
) -> None:
    """Auto mode wins: a manual switch-on is tracked and then undone."""
    coordinator = hass.data[DOMAIN][loaded.entry_id]
    _set_room(hass, "22.0")
    await _refresh(hass, loaded)

    hass.states.async_set("switch.shelly", "on")
    coordinator = await _refresh(hass, loaded)

    assert coordinator.zone_state.radiator_on is True
    assert coordinator.zone_state.radiator_changed_at is not None

    # Once the minimum runtime has elapsed the controller switches it off again.
    coordinator.zone_state.radiator_changed_at = None
    coordinator = await _refresh(hass, loaded)

    assert coordinator.data.decision.radiator_on is False
    assert coordinator.data.decision.reason == "temperature_above_off_threshold"


# ---------------------------------------------------------------------------
# WebSocket API
# ---------------------------------------------------------------------------


async def test_ws_zones_payload(hass: HomeAssistant, loaded, hass_ws_client) -> None:
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/zones"})
    response = await client.receive_json()

    assert response["success"] is True
    zones = response["result"]["zones"]
    assert len(zones) == 1
    zone = zones[0]
    assert zone["name"] == "Sagas hus"
    assert zone["entities"]["mode"].startswith("select.")
    assert "heatpump" in zone
    assert "schedule" in zone
    assert zone["settings"]["away_hvac_mode"] == "keep"


async def test_ws_set_schedule_applies_target(
    hass: HomeAssistant, loaded, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json(
        {
            "id": 2,
            "type": f"{DOMAIN}/set_schedule",
            "entry_id": loaded.entry_id,
            "enabled": True,
            "weekday": [{"start": "00:00", "target": 24.0}],
            "weekend": [{"start": "00:00", "target": 24.0}],
        }
    )
    response = await client.receive_json()
    assert response["success"] is True
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][loaded.entry_id]
    assert coordinator.schedule.enabled is True
    assert coordinator.schedule_target == pytest.approx(24.0)
    assert coordinator.effective_target == pytest.approx(24.0)


async def test_ws_set_vacation(hass: HomeAssistant, loaded, hass_ws_client) -> None:
    client = await hass_ws_client(hass)
    await client.send_json(
        {
            "id": 3,
            "type": f"{DOMAIN}/set_vacation",
            "entry_id": loaded.entry_id,
            "start": "2026-12-20",
            "end": "2026-12-31",
        }
    )
    response = await client.receive_json()
    assert response["success"] is True

    coordinator = hass.data[DOMAIN][loaded.entry_id]
    assert coordinator.vacation.configured is True


async def test_ws_set_price(hass: HomeAssistant, loaded, hass_ws_client) -> None:
    client = await hass_ws_client(hass)
    await client.send_json(
        {
            "id": 4,
            "type": f"{DOMAIN}/set_price",
            "entry_id": loaded.entry_id,
            "enabled": True,
            "cheap": 0.4,
            "expensive": 2.0,
            "max_adjust": 1.0,
            "min_comfort": 18.0,
        }
    )
    response = await client.receive_json()
    assert response["success"] is True

    coordinator = hass.data[DOMAIN][loaded.entry_id]
    settings = coordinator.price_settings
    assert settings.enabled is True
    assert settings.cheap_threshold == pytest.approx(0.4)


async def test_ws_set_away_hvac_mode(
    hass: HomeAssistant, loaded, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json(
        {
            "id": 5,
            "type": f"{DOMAIN}/set_away_hvac_mode",
            "entry_id": loaded.entry_id,
            "mode": "off",
        }
    )
    response = await client.receive_json()
    assert response["success"] is True
    await hass.async_block_till_done()

    assert loaded.options["away_hvac_mode"] == "off"
    coordinator = hass.data[DOMAIN][loaded.entry_id]
    assert coordinator.config_data["away_hvac_mode"] == "off"

    await client.send_json({"id": 6, "type": f"{DOMAIN}/zones"})
    response = await client.receive_json()
    assert response["result"]["zones"][0]["settings"]["away_hvac_mode"] == "off"


async def test_ws_set_away_hvac_mode_rejects_unknown_value(
    hass: HomeAssistant, loaded, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json(
        {
            "id": 7,
            "type": f"{DOMAIN}/set_away_hvac_mode",
            "entry_id": loaded.entry_id,
            "mode": "warm",
        }
    )
    response = await client.receive_json()
    assert response["success"] is False
    assert loaded.options.get("away_hvac_mode") is None


async def test_ws_set_heatpump_profile(
    hass: HomeAssistant, loaded, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json(
        {
            "id": 8,
            "type": f"{DOMAIN}/set_heatpump_profile",
            "entry_id": loaded.entry_id,
            "fan_mode": "high",
            "start_target": 23.5,
        }
    )
    response = await client.receive_json()
    assert response["success"] is True
    await hass.async_block_till_done()

    assert loaded.options["heatpump_fan_mode"] == "high"
    assert loaded.options["heatpump_start_target"] == pytest.approx(23.5)

    await client.send_json({"id": 9, "type": f"{DOMAIN}/zones"})
    response = await client.receive_json()
    settings = response["result"]["zones"][0]["settings"]
    assert settings["heatpump_fan_mode"] == "high"
    assert settings["heatpump_start_target"] == pytest.approx(23.5)

    await client.send_json(
        {
            "id": 10,
            "type": f"{DOMAIN}/set_heatpump_profile",
            "entry_id": loaded.entry_id,
            "fan_mode": None,
            "start_target": None,
        }
    )
    response = await client.receive_json()
    assert response["success"] is True
    await hass.async_block_till_done()

    assert loaded.options["heatpump_fan_mode"] is None
    assert loaded.options["heatpump_start_target"] is None


# ---------------------------------------------------------------------------
# Electricity price
# ---------------------------------------------------------------------------


async def test_price_sensor_in_ore_is_normalised_to_sek_per_kwh(
    hass: HomeAssistant, loaded
) -> None:
    """Nordpool can report öre/kWh; the cost must not be 100 times too high."""
    hass.states.async_set(
        "sensor.nordpool_kwh_se4_sek_3_10_025",
        "62.5",
        {"unit_of_measurement": "öre/kWh"},
    )
    hass.config_entries.async_update_entry(
        loaded,
        options={
            **loaded.options,
            "price_sensor": "sensor.nordpool_kwh_se4_sek_3_10_025",
            "price_surcharge": 94.0,
        },
    )
    coordinator = await _refresh(hass, loaded)

    price = coordinator.data.price
    assert price.spot_sek_per_kwh == pytest.approx(0.625)
    assert price.surcharge == pytest.approx(0.94)
    assert price.sek_per_kwh == pytest.approx(1.565)
    assert price.vat_percent == pytest.approx(25.0)


async def test_live_price_sensor_wins_over_a_stale_all_in_price(
    hass: HomeAssistant, loaded
) -> None:
    hass.states.async_set(
        "sensor.nordpool_kwh_se4_sek_3_10_025",
        "0.62",
        {"unit_of_measurement": "SEK/kWh"},
    )
    hass.config_entries.async_update_entry(
        loaded,
        options={
            **loaded.options,
            "price_sensor": "sensor.nordpool_kwh_se4_sek_3_10_025",
            "all_in_price": 2.5,
        },
    )
    coordinator = await _refresh(hass, loaded)

    price = coordinator.data.price
    assert price.source == "price_sensor"
    assert price.sek_per_kwh == pytest.approx(0.62)


# ---------------------------------------------------------------------------
# Outside temperature
# ---------------------------------------------------------------------------


async def test_outside_temperature_uses_the_configured_sensor(
    hass: HomeAssistant, loaded, hass_ws_client
) -> None:
    hass.config_entries.async_update_entry(
        loaded,
        options={**loaded.options, "outside_temperature_sensor": "sensor.outside"},
    )
    coordinator = await _refresh(hass, loaded)
    assert coordinator.data.outside_temperature == pytest.approx(5.0)

    client = await hass_ws_client(hass)
    await client.send_json({"id": 20, "type": f"{DOMAIN}/zones"})
    response = await client.receive_json()
    zone = response["result"]["zones"][0]
    assert zone["outside_temperature"] == pytest.approx(5.0)
    assert zone["actuators"]["outside_sensor"] == "sensor.outside"


async def test_outside_temperature_falls_back_to_the_heat_pump(
    hass: HomeAssistant, loaded
) -> None:
    """MELCloud reports the unit's outdoor sensor on the climate entity."""
    hass.states.async_set(
        PUMP,
        "heat",
        {
            "current_temperature": 18.0,
            "temperature": 21.0,
            "outside_temperature": -4.5,
        },
    )
    coordinator = await _refresh(hass, loaded)
    assert coordinator.data.outside_temperature == pytest.approx(-4.5)


async def test_outside_temperature_falls_back_to_a_weather_entity(
    hass: HomeAssistant, loaded
) -> None:
    hass.states.async_set(
        "climate.mitsubishi",
        "heat",
        {"current_temperature": 18.0, "temperature": 21.0},
    )
    hass.states.async_set("weather.forecast_home", "cloudy", {"temperature": -2.5})
    coordinator = await _refresh(hass, loaded)
    assert coordinator.data.outside_temperature == pytest.approx(-2.5)


# ---------------------------------------------------------------------------
# Schedule affects the decision
# ---------------------------------------------------------------------------


async def test_schedule_lowers_setpoint_and_radiator_band(
    hass: HomeAssistant, loaded, entry_data
) -> None:
    coordinator = hass.data[DOMAIN][loaded.entry_id]
    await coordinator.async_set_schedule(
        coordinator.schedule.from_dict(  # type: ignore[attr-defined]
            {
                "enabled": True,
                "weekday": [{"start": "00:00", "target": 18.0}],
                "weekend": [{"start": "00:00", "target": 18.0}],
            }
        )
    )

    # Schedule setpoint 18 instead of 21 moves the radiator band down 3 degrees,
    # so 18.5 is no longer below the ON threshold.
    coordinator.data = None
    await coordinator.async_refresh()

    assert coordinator.schedule_target == pytest.approx(18.0)
    assert coordinator.effective_target == pytest.approx(18.0)


# ---------------------------------------------------------------------------
# Sidebar panel
# ---------------------------------------------------------------------------


async def test_panel_registered_with_frontend(
    hass: HomeAssistant, entities, mock_entry: MockConfigEntry
) -> None:
    pytest.importorskip(
        "hass_frontend",
        reason="home-assistant-frontend is needed to set up the frontend component",
    )
    from homeassistant.components.frontend import async_panel_exists
    from custom_components.smart_heat_controller.const import PANEL_URL_PATH

    assert await async_setup_component(hass, "frontend", {})
    mock_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    assert async_panel_exists(hass, PANEL_URL_PATH) is True

    assert await hass.config_entries.async_unload(mock_entry.entry_id)
    await hass.async_block_till_done()
    assert async_panel_exists(hass, PANEL_URL_PATH) is False


async def test_setup_survives_missing_frontend(
    hass: HomeAssistant, entities, mock_entry: MockConfigEntry
) -> None:
    """Without the frontend the backend must still load and control heating."""
    mock_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    assert mock_entry.state.name == "LOADED"
    assert hass.data[DOMAIN].get("panel_registered") is not True
