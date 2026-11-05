"""Select entity exposing the controller operating mode."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN
from .controller import Mode
from .coordinator import SmartHeatCoordinator
from .entity import SmartHeatEntity

MODE_OPTIONS = [str(mode) for mode in Mode]


async def async_setup_entry(
    hass: HomeAssistant,
    entry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator: SmartHeatCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([SmartHeatModeSelect(coordinator)])


class SmartHeatModeSelect(SmartHeatEntity, SelectEntity):
    """Auto/Home/Away/Comfort/Eco/Boost/Manual/Disabled."""

    _attr_translation_key = "mode"
    _attr_options = MODE_OPTIONS
    _attr_icon = "mdi:thermostat-auto"

    def __init__(self, coordinator: SmartHeatCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.entry.entry_id}_mode"

    @property
    def current_option(self) -> str | None:
        return str(self.coordinator.zone_state.selected_mode)

    async def async_select_option(self, option: str) -> None:
        await self.coordinator.async_set_mode(Mode(option))
