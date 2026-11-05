"""Integration level tests: setup, entities, control loop and restart."""

from __future__ import annotations

from datetime import timedelta

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.smart_heat_controller.const import DOMAIN


@pytest.fixture
async def setup_states(hass: HomeAssistant) -> None:
    """Create the external entities the integration reads."""
    hass.states.async_set(
        "climate.mitsubishi",
        "heat",
        {"current_temperature": 18.0, "temperature": 21.0, "hvac_modes": ["heat", "off"]},
    )
    hass.states.async_set("switch.shelly", STATE_OFF)
    hass.states.async_set(
        "sensor.room_temperature", "18.0", {"unit_of_measurement": "°C", "device_class": "temperature"}
    )
    hass.states.async_set(
        "sensor.shelly_power", "0", {"unit_of_measurement": "W", "device_class": "power"}
    )
    hass.states.async_set(
        "sensor.shelly_energy",
        "10.0",
        {
            "unit_of_measurement": "kWh",
            "device_class": "energy",
            "state_class": "total_increasing",
        },
    )
    hass.states.async_set(
        "sensor.mitsubishi_energy",
        "480.30",
        {
            "unit_of_measurement": "kWh",
            "device_class": "energy",
            "state_class": "total_increasing",
        },
    )
    hass.states.async_set("device_tracker.saga_phone", "home")


async def _setup_entry(
    hass: HomeAssistant, mock_entry: MockConfigEntry
) -> MockConfigEntry:
    mock_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    return mock_entry


async def test_setup_and_unload(
    hass: HomeAssistant, setup_states, mock_entry: MockConfigEntry
) -> None:
    await _setup_entry(hass, mock_entry)

    assert mock_entry.state is ConfigEntryState.LOADED
    assert hass.states.get("select.sagas_hus_operating_mode") is not None
    assert hass.states.get("sensor.sagas_hus_room_temperature") is not None
    assert hass.states.get("sensor.sagas_hus_heat_pump_energy_today") is not None
    assert hass.states.get("binary_sensor.sagas_hus_presence") is not None

    assert await hass.config_entries.async_unload(mock_entry.entry_id)
    await hass.async_block_till_done()
    assert mock_entry.state is ConfigEntryState.NOT_LOADED


async def test_mode_select_changes_controller_state(
    hass: HomeAssistant, setup_states, mock_entry: MockConfigEntry
) -> None:
    async def _noop(call) -> None:
        return None

    hass.services.async_register("switch", "turn_on", _noop)
    hass.services.async_register("switch", "turn_off", _noop)
    hass.services.async_register("climate", "set_temperature", _noop)

    await _setup_entry(hass, mock_entry)
    entity_id = "select.sagas_hus_operating_mode"

    await hass.services.async_call(
        "select",
        "select_option",
        {"entity_id": entity_id, "option": "away"},
        blocking=True,
    )
    await hass.async_block_till_done()

    assert hass.states.get(entity_id).state == "away"
    coordinator = hass.data[DOMAIN][mock_entry.entry_id]
    assert coordinator.data.decision.effective_mode.value == "away"


async def test_energy_counter_delta_is_recorded(
    hass: HomeAssistant, setup_states, mock_entry: MockConfigEntry
) -> None:
    await _setup_entry(hass, mock_entry)
    coordinator = hass.data[DOMAIN][mock_entry.entry_id]

    # First reading primes the counter baseline.
    coordinator.data = None
    await coordinator.async_refresh()

    hass.states.async_set(
        "sensor.mitsubishi_energy",
        "483.40",
        {
            "unit_of_measurement": "kWh",
            "device_class": "energy",
            "state_class": "total_increasing",
        },
    )
    await coordinator.async_refresh()
    await hass.async_block_till_done()

    today = dt_util.now().date()
    bucket = coordinator.ledger.bucket("heatpump", today)
    assert bucket is not None
    assert bucket.kwh == pytest.approx(3.1, rel=1e-3)


async def test_dry_run_does_not_call_services(
    hass: HomeAssistant, setup_states, entry_data: dict
) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN, title="Sagas hus", data={**entry_data, "dry_run": True}
    )
    entry.add_to_hass(hass)

    calls: list[str] = []

    async def _record(call) -> None:
        calls.append(call.service)

    hass.services.async_register("switch", "turn_on", _record)
    hass.services.async_register("switch", "turn_off", _record)

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id]
    assert coordinator.data.decision.dry_run is True
    assert calls == []


async def test_radiator_turns_on_when_cold(
    hass: HomeAssistant, setup_states, mock_entry: MockConfigEntry
) -> None:
    calls: list[tuple[str, dict]] = []

    async def _record(call) -> None:
        calls.append((call.service, dict(call.data)))

    hass.services.async_register("switch", "turn_on", _record)
    hass.services.async_register("switch", "turn_off", _record)
    hass.services.async_register("climate", "set_temperature", _record)

    await _setup_entry(hass, mock_entry)

    assert any(service == "turn_on" for service, _ in calls)


async def test_restart_adopts_real_switch_state(
    hass: HomeAssistant, setup_states, mock_entry: MockConfigEntry
) -> None:
    # The plug is physically ON, and the room is warm. If the controller
    # assumed its own persisted OFF state it would do nothing; instead it must
    # observe reality and turn the radiator off.
    hass.states.async_set("switch.shelly", STATE_ON)
    hass.states.async_set("sensor.room_temperature", "23.0", {"unit_of_measurement": "°C"})

    calls: list[str] = []

    async def _record(call) -> None:
        calls.append(call.service)

    hass.services.async_register("switch", "turn_on", _record)
    hass.services.async_register("switch", "turn_off", _record)
    hass.services.async_register("climate", "set_temperature", _record)

    await _setup_entry(hass, mock_entry)

    coordinator = hass.data[DOMAIN][mock_entry.entry_id]
    assert "turn_off" in calls
    assert "turn_on" not in calls
    assert coordinator.data.snapshot.radiator_is_on is True


async def test_unavailable_radiator_is_not_commanded(
    hass: HomeAssistant, setup_states, mock_entry: MockConfigEntry
) -> None:
    hass.states.async_set("switch.shelly", "unavailable")
    hass.states.async_set("sensor.room_temperature", "10.0", {"unit_of_measurement": "°C"})

    calls: list[str] = []

    async def _record(call) -> None:
        calls.append(call.service)

    hass.services.async_register("switch", "turn_on", _record)

    await _setup_entry(hass, mock_entry)

    coordinator = hass.data[DOMAIN][mock_entry.entry_id]
    assert coordinator.data.radiator.available is False
    assert "turn_on" not in calls


async def test_baseline_services(
    hass: HomeAssistant, setup_states, mock_entry: MockConfigEntry
) -> None:
    await _setup_entry(hass, mock_entry)

    await hass.services.async_call(
        DOMAIN, "start_baseline", {"entry_id": mock_entry.entry_id}, blocking=True
    )
    coordinator = hass.data[DOMAIN][mock_entry.entry_id]
    assert coordinator.baseline.active is True

    await hass.services.async_call(
        DOMAIN, "stop_baseline", {"entry_id": mock_entry.entry_id}, blocking=True
    )
    assert coordinator.baseline.recorded is True


async def test_boost_service_sets_expiry(
    hass: HomeAssistant, setup_states, mock_entry: MockConfigEntry
) -> None:
    await _setup_entry(hass, mock_entry)

    await hass.services.async_call(
        DOMAIN,
        "set_mode",
        {"entry_id": mock_entry.entry_id, "mode": "boost", "duration": 30},
        blocking=True,
    )

    coordinator = hass.data[DOMAIN][mock_entry.entry_id]
    assert coordinator.zone_state.selected_mode.value == "boost"
    assert coordinator.zone_state.boost_until is not None
    assert coordinator.zone_state.boost_until > dt_util.now() + timedelta(minutes=20)
