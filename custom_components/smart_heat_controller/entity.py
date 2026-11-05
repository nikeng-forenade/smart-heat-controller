"""Shared entity base for Smart Heat Controller."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, VERSION
from .coordinator import SmartHeatCoordinator, ZoneData


class SmartHeatEntity(CoordinatorEntity[SmartHeatCoordinator]):
    """Base class wiring an entity to the zone device."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: SmartHeatCoordinator) -> None:
        super().__init__(coordinator)

    @property
    def data(self) -> ZoneData | None:
        return self.coordinator.data

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self.coordinator.entry.entry_id)},
            name=self.coordinator.zone_name,
            manufacturer="Smart Heat Controller",
            model="Heating zone",
            sw_version=VERSION,
        )

    @property
    def zone_slug(self) -> str:
        """Stable suffix so multiple zones never collide."""
        return self.coordinator.entry.entry_id
