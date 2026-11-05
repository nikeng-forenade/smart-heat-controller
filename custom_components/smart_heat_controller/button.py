"""Buttons for the baseline workflow and diagnostics."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN
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
            SmartHeatButton(coordinator, key="start_baseline", icon="mdi:record-circle"),
            SmartHeatButton(coordinator, key="stop_baseline", icon="mdi:stop-circle"),
            SmartHeatButton(coordinator, key="refresh", icon="mdi:refresh"),
        ]
    )


class SmartHeatButton(SmartHeatEntity, ButtonEntity):
    """Simple action button."""

    def __init__(
        self, coordinator: SmartHeatCoordinator, *, key: str, icon: str
    ) -> None:
        super().__init__(coordinator)
        self._key = key
        self._attr_translation_key = key
        self._attr_icon = icon
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{key}"

    async def async_press(self) -> None:
        match self._key:
            case "start_baseline":
                await self.coordinator.async_start_baseline()
            case "stop_baseline":
                await self.coordinator.async_stop_baseline()
            case _:
                await self.coordinator.async_refresh()
