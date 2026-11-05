"""Climate entity representing the heating zone as a native thermostat.

This is a *zone* thermostat, not a copy of the heat pump. It reads the zone
temperature and the currently effective target, and writing to it updates the
zone's own settings through the coordinator. It never talks to the heat pump
directly, so there is no second controller fighting the state machine.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityFeature,
    HVACAction,
    HVACMode,
)
from homeassistant.const import ATTR_TEMPERATURE, UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import (
    CONF_AWAY_TARGET,
    CONF_HOME_TARGET,
    DOMAIN,
    MAX_TARGET_TEMP,
    MIN_TARGET_TEMP,
)
from .controller import Mode, Presence
from .coordinator import SmartHeatCoordinator
from .entity import SmartHeatEntity

# Presets map 1:1 onto the controller's operating modes.
PRESET_TO_MODE: dict[str, Mode] = {
    "auto": Mode.AUTO,
    "home": Mode.HOME,
    "away": Mode.AWAY,
    "comfort": Mode.COMFORT,
    "eco": Mode.ECO,
    "boost": Mode.BOOST,
    "manual": Mode.MANUAL,
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator: SmartHeatCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([SmartHeatClimate(coordinator)])


class SmartHeatClimate(SmartHeatEntity, ClimateEntity):
    """The zone thermostat."""

    _attr_translation_key = "zone_thermostat"
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_target_temperature_step = 0.5
    _attr_min_temp = MIN_TARGET_TEMP
    _attr_max_temp = MAX_TARGET_TEMP
    _attr_hvac_modes = [HVACMode.HEAT, HVACMode.OFF]
    _attr_preset_modes = list(PRESET_TO_MODE)
    _attr_supported_features = (
        ClimateEntityFeature.TARGET_TEMPERATURE | ClimateEntityFeature.PRESET_MODE
    )
    _enable_turn_on_off_backwards_compatibility = False

    def __init__(self, coordinator: SmartHeatCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.entry.entry_id}_thermostat"

    # ------------------------------------------------------------------
    # State
    # ------------------------------------------------------------------
    @property
    def current_temperature(self) -> float | None:
        return self.data.snapshot.room_temperature if self.data else None

    @property
    def target_temperature(self) -> float | None:
        """The setpoint the controller is currently working towards."""
        if self.data is None:
            return None
        return self.coordinator.effective_target

    @property
    def hvac_mode(self) -> HVACMode:
        if self.coordinator.zone_state.selected_mode is Mode.DISABLED:
            return HVACMode.OFF
        return HVACMode.HEAT

    @property
    def hvac_action(self) -> HVACAction | None:
        if self.hvac_mode is HVACMode.OFF:
            return HVACAction.OFF
        if self.coordinator.zone_state.radiator_on:
            return HVACAction.HEATING
        heatpump = self.coordinator.heatpump_heating()
        if heatpump:
            return HVACAction.HEATING
        return HVACAction.IDLE

    @property
    def preset_mode(self) -> str | None:
        selected = str(self.coordinator.zone_state.selected_mode)
        return selected if selected in PRESET_TO_MODE else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.data
        state = self.coordinator.zone_state
        return {
            "effective_mode": str(data.decision.effective_mode) if data else None,
            "presence": str(data.decision.presence) if data else None,
            "reason": data.decision.reason if data else None,
            "faults": [str(fault) for fault in data.decision.faults] if data else [],
            "dry_run": data.decision.dry_run if data else None,
            "radiator_on": state.radiator_on,
            "radiator_power_w": data.radiator.power_w if data else None,
            "heatpump_target": data.snapshot.heatpump_target if data else None,
            "schedule_target": self.coordinator.schedule_target,
        }

    # ------------------------------------------------------------------
    # Commands
    # ------------------------------------------------------------------
    async def async_set_temperature(self, **kwargs: Any) -> None:
        """Write into the setting that governs the current situation."""
        temperature = kwargs.get(ATTR_TEMPERATURE)
        if temperature is None:
            return

        value = float(temperature)
        if not self._attr_min_temp <= value <= self._attr_max_temp:
            return

        key = CONF_HOME_TARGET
        if self.data is not None and self.data.decision.presence is Presence.AWAY:
            key = CONF_AWAY_TARGET

        await self.coordinator.async_set_number(key, value)

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        mode = Mode.AUTO if hvac_mode is HVACMode.HEAT else Mode.DISABLED
        await self.coordinator.async_set_mode(mode)

    async def async_set_preset_mode(self, preset_mode: str) -> None:
        mode = PRESET_TO_MODE.get(preset_mode)
        if mode is not None:
            await self.coordinator.async_set_mode(mode)

    async def async_turn_on(self) -> None:
        await self.coordinator.async_set_mode(Mode.AUTO)

    async def async_turn_off(self) -> None:
        await self.coordinator.async_set_mode(Mode.DISABLED)
