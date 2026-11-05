"""Switches for enabling automation and price optimisation."""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import CONF_DRY_RUN, DOMAIN
from .coordinator import SmartHeatCoordinator
from .entity import SmartHeatEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator: SmartHeatCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([SmartHeatDryRunSwitch(coordinator)])


class SmartHeatDryRunSwitch(SmartHeatEntity, SwitchEntity):
    """Master switch: when on, decisions are computed but never executed."""

    _attr_translation_key = "dry_run"
    _attr_icon = "mdi:test-tube"

    def __init__(self, coordinator: SmartHeatCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.entry.entry_id}_dry_run"

    @property
    def is_on(self) -> bool:
        return self.coordinator.zone_config.dry_run

    async def async_turn_on(self, **kwargs) -> None:
        await self.coordinator.async_set_option(CONF_DRY_RUN, True)

    async def async_turn_off(self, **kwargs) -> None:
        await self.coordinator.async_set_option(CONF_DRY_RUN, False)
