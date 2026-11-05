"""Number entities for the quick settings shown on the dashboard."""

from __future__ import annotations

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import (
    CONF_AWAY_TARGET,
    CONF_HOME_TARGET,
    CONF_HYSTERESIS,
    CONF_MIN_OFF_MINUTES,
    CONF_MIN_ON_MINUTES,
    CONF_MIN_SAFETY_TEMP,
    CONF_RADIATOR_OFF_ABOVE,
    CONF_RADIATOR_ON_BELOW,
    DOMAIN,
    MAX_TARGET_TEMP,
    MIN_TARGET_TEMP,
)
from .coordinator import SmartHeatCoordinator
from .entity import SmartHeatEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator: SmartHeatCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        [
            SmartHeatNumber(
                coordinator,
                key=CONF_HOME_TARGET,
                name_key="home_target",
                icon="mdi:home-thermometer",
                minimum=MIN_TARGET_TEMP,
                maximum=MAX_TARGET_TEMP,
                step=0.5,
                unit=UnitOfTemperature.CELSIUS,
            ),
            SmartHeatNumber(
                coordinator,
                key=CONF_AWAY_TARGET,
                name_key="away_target",
                icon="mdi:home-export-outline",
                minimum=MIN_TARGET_TEMP,
                maximum=MAX_TARGET_TEMP,
                step=0.5,
                unit=UnitOfTemperature.CELSIUS,
            ),
            SmartHeatNumber(
                coordinator,
                key=CONF_RADIATOR_ON_BELOW,
                name_key="radiator_on_below",
                icon="mdi:radiator",
                minimum=MIN_TARGET_TEMP,
                maximum=MAX_TARGET_TEMP,
                step=0.5,
                unit=UnitOfTemperature.CELSIUS,
            ),
            SmartHeatNumber(
                coordinator,
                key=CONF_RADIATOR_OFF_ABOVE,
                name_key="radiator_off_above",
                icon="mdi:radiator-disabled",
                minimum=MIN_TARGET_TEMP,
                maximum=MAX_TARGET_TEMP,
                step=0.5,
                unit=UnitOfTemperature.CELSIUS,
            ),
            SmartHeatNumber(
                coordinator,
                key=CONF_MIN_SAFETY_TEMP,
                name_key="min_safety_temp",
                icon="mdi:snowflake-alert",
                minimum=5.0,
                maximum=25.0,
                step=0.5,
                unit=UnitOfTemperature.CELSIUS,
            ),
            SmartHeatNumber(
                coordinator,
                key=CONF_HYSTERESIS,
                name_key="hysteresis",
                icon="mdi:sine-wave",
                minimum=0.1,
                maximum=3.0,
                step=0.1,
                unit=UnitOfTemperature.CELSIUS,
            ),
            SmartHeatNumber(
                coordinator,
                key=CONF_MIN_ON_MINUTES,
                name_key="min_on_minutes",
                icon="mdi:timer-play-outline",
                minimum=0,
                maximum=120,
                step=1,
                unit="min",
            ),
            SmartHeatNumber(
                coordinator,
                key=CONF_MIN_OFF_MINUTES,
                name_key="min_off_minutes",
                icon="mdi:timer-pause-outline",
                minimum=0,
                maximum=120,
                step=1,
                unit="min",
            ),
        ]
    )


class SmartHeatNumber(SmartHeatEntity, NumberEntity):
    """A persisted numeric zone setting."""

    _attr_mode = NumberMode.BOX

    def __init__(
        self,
        coordinator: SmartHeatCoordinator,
        *,
        key: str,
        name_key: str,
        icon: str,
        minimum: float,
        maximum: float,
        step: float,
        unit: str,
    ) -> None:
        super().__init__(coordinator)
        self._key = key
        self._attr_translation_key = name_key
        self._attr_icon = icon
        self._attr_native_min_value = minimum
        self._attr_native_max_value = maximum
        self._attr_native_step = step
        self._attr_native_unit_of_measurement = unit
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{key}"

    @property
    def native_value(self) -> float | None:
        value = self.coordinator.config_data.get(self._key)
        return float(value) if value is not None else None

    async def async_set_native_value(self, value: float) -> None:
        await self.coordinator.async_set_number(self._key, value)
        self.async_write_ha_state()
