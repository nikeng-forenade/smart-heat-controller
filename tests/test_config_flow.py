"""Config and options flow tests."""

from __future__ import annotations

import pytest
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.smart_heat_controller.const import DOMAIN


@pytest.fixture(autouse=True)
async def flow_states(hass: HomeAssistant) -> None:
    hass.states.async_set(
        "climate.mitsubishi", "heat", {"current_temperature": 20.0, "temperature": 20.0}
    )
    hass.states.async_set("switch.shelly", "off")
    hass.states.async_set(
        "sensor.room_temperature", "20.0", {"unit_of_measurement": "°C", "device_class": "temperature"}
    )
    hass.states.async_set(
        "sensor.shelly_power", "0", {"unit_of_measurement": "W", "device_class": "power"}
    )
    hass.states.async_set(
        "sensor.shelly_energy",
        "10.0",
        {"unit_of_measurement": "kWh", "device_class": "energy", "state_class": "total_increasing"},
    )
    hass.states.async_set(
        "sensor.mitsubishi_energy",
        "480.30",
        {"unit_of_measurement": "kWh", "device_class": "energy", "state_class": "total_increasing"},
    )
    hass.states.async_set("device_tracker.saga_phone", "home")


async def _walk_wizard(hass: HomeAssistant) -> config_entries.ConfigFlow:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"zone_name": "Sagas hus", "area": 15},
    )
    assert result["step_id"] == "primary"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"primary_climate": "climate.mitsubishi"}
    )
    assert result["step_id"] == "supplementary"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "supplementary_switches": ["switch.shelly"],
            "supplementary_power_sensor": "sensor.shelly_power",
            "supplementary_energy_sensor": "sensor.shelly_energy",
            "supplementary_nominal_power": 800,
        },
    )
    assert result["step_id"] == "temperature"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "temperature_sensor": "sensor.room_temperature",
            "temperature_offset": 0.0,
            "stale_timeout": 30,
        },
    )
    assert result["step_id"] == "presence"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "presence_entities": ["device_tracker.saga_phone"],
            "absence_delay": 30,
            "arrival_confirm": 0,
            "unknown_behavior": "keep_last",
        },
    )
    assert result["step_id"] == "temperatures"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "home_target": 21.0,
            "away_target": 18.0,
            "radiator_on_below": 19.0,
            "radiator_off_above": 20.0,
            "min_safety_temp": 16.0,
            "hysteresis": 0.5,
            "min_on_minutes": 10,
            "min_off_minutes": 10,
        },
    )
    assert result["step_id"] == "review"
    return result


async def test_full_wizard_creates_entry(hass: HomeAssistant) -> None:
    result = await _walk_wizard(hass)

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"dry_run": True}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Sagas hus"
    assert result["data"]["dry_run"] is True
    assert result["data"]["supplementary_switches"] == ["switch.shelly"]


async def test_temperature_source_is_required(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"zone_name": "Test"}
    )
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "supplementary_switches": ["switch.shelly"],
            "supplementary_nominal_power": 800,
        },
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"temperature_offset": 0.0, "stale_timeout": 30}
    )

    assert result["type"] is FlowResultType.FORM
    assert result["errors"]["base"] == "need_temperature_source"


async def test_energy_sensor_must_be_total_increasing(hass: HomeAssistant) -> None:
    hass.states.async_set(
        "sensor.bad_energy",
        "1.0",
        {"unit_of_measurement": "kWh", "device_class": "energy"},
    )
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"zone_name": "Test"}
    )
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "supplementary_switches": ["switch.shelly"],
            "supplementary_energy_sensor": "sensor.bad_energy",
            "supplementary_nominal_power": 800,
        },
    )

    assert result["type"] is FlowResultType.FORM
    assert (
        result["errors"]["base"] == "energy_sensor_needs_total_state_class"
    )


async def test_invalid_temperature_band_is_rejected(hass: HomeAssistant) -> None:
    result = await _walk_wizard(hass)

    # Walk back: the review step is already shown, so drive a fresh flow.
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"zone_name": "Test"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"primary_climate": "climate.mitsubishi"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "supplementary_switches": ["switch.shelly"],
            "supplementary_nominal_power": 800,
        },
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"temperature_offset": 0.0, "stale_timeout": 30}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "presence_entities": [],
            "absence_delay": 30,
            "arrival_confirm": 0,
            "unknown_behavior": "keep_last",
        },
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "home_target": 21.0,
            "away_target": 18.0,
            "radiator_on_below": 20.0,
            "radiator_off_above": 19.0,
            "min_safety_temp": 16.0,
            "hysteresis": 0.5,
            "min_on_minutes": 10,
            "min_off_minutes": 10,
        },
    )

    assert result["type"] is FlowResultType.FORM
    assert result["errors"]["base"] == "off_above_must_exceed_on_below"


async def test_options_flow_updates_temperatures(hass: HomeAssistant, mock_entry) -> None:
    async def _noop(call) -> None:
        return None

    hass.services.async_register("switch", "turn_on", _noop)
    hass.services.async_register("switch", "turn_off", _noop)
    hass.services.async_register("climate", "set_temperature", _noop)

    mock_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    result = await hass.config_entries.options.async_init(mock_entry.entry_id)
    assert result["type"] is FlowResultType.MENU

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "temperatures"}
    )
    assert result["step_id"] == "temperatures"

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            "home_target": 22.0,
            "away_target": 17.0,
            "radiator_on_below": 19.0,
            "radiator_off_above": 20.0,
            "min_safety_temp": 15.0,
            "hysteresis": 0.5,
            "min_on_minutes": 10,
            "min_off_minutes": 10,
        },
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert mock_entry.options["home_target"] == 22.0
    coordinator = hass.data[DOMAIN][mock_entry.entry_id]
    assert coordinator.zone_config.home_target == 22.0


async def test_options_flow_can_disable_the_panel(
    hass: HomeAssistant, mock_entry
) -> None:
    async def _noop(call) -> None:
        return None

    hass.services.async_register("switch", "turn_on", _noop)
    hass.services.async_register("switch", "turn_off", _noop)
    hass.services.async_register("climate", "set_temperature", _noop)

    mock_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    result = await hass.config_entries.options.async_init(mock_entry.entry_id)
    assert "general" in result["menu_options"]

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "general"}
    )
    assert result["step_id"] == "general"

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"panel_enabled": False}
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert mock_entry.options["panel_enabled"] is False


async def test_options_flow_saves_energy_without_heatpump_power_sensor(
    hass: HomeAssistant, mock_entry
) -> None:
    """Optional sensors that are unset must not block the energy step."""

    async def _noop(call) -> None:
        return None

    hass.services.async_register("switch", "turn_on", _noop)
    hass.services.async_register("switch", "turn_off", _noop)
    hass.services.async_register("climate", "set_temperature", _noop)

    mock_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    result = await hass.config_entries.options.async_init(mock_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "energy"}
    )
    assert result["step_id"] == "energy"

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            "supplementary_power_sensor": "sensor.shelly_power",
            "supplementary_energy_sensor": "sensor.shelly_energy",
            "heatpump_energy_sensor": "sensor.mitsubishi_energy",
        },
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert mock_entry.options["heatpump_energy_sensor"] == "sensor.mitsubishi_energy"
    assert "heatpump_power_sensor" not in mock_entry.options


async def test_options_flow_saves_price_without_all_in_price(
    hass: HomeAssistant, mock_entry
) -> None:
    """An unset all-in price must not block the price step."""

    async def _noop(call) -> None:
        return None

    hass.states.async_set(
        "sensor.spot_price", "1.25", {"unit_of_measurement": "SEK/kWh"}
    )
    hass.services.async_register("switch", "turn_on", _noop)
    hass.services.async_register("switch", "turn_off", _noop)
    hass.services.async_register("climate", "set_temperature", _noop)

    mock_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()

    result = await hass.config_entries.options.async_init(mock_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "price"}
    )
    assert result["step_id"] == "price"

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {"price_sensor": "sensor.spot_price", "price_optimization": True},
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert mock_entry.options["price_sensor"] == "sensor.spot_price"
    assert mock_entry.options["price_optimization"] is True
    assert "all_in_price" not in mock_entry.options
