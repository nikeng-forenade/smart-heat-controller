"""Binary sensors for presence, faults and energy integrity alerts."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import CONF_SUPPLEMENTARY_NOMINAL_POWER, DOMAIN
from .controller import Fault, Mode, Presence
from .coordinator import SmartHeatCoordinator, ZoneData
from .entity import SmartHeatEntity

POWER_TOLERANCE = 1.2  # 20 % over the configured nominal power is suspicious


@dataclass(frozen=True, kw_only=True)
class SmartHeatBinaryDescription(BinarySensorEntityDescription):
    value_fn: Callable[[ZoneData], bool | None]
    attrs_fn: Callable[[ZoneData], dict[str, object]] | None = None


def _any(fault: Fault) -> Callable[[ZoneData], bool]:
    return lambda data: fault in data.decision.faults


DESCRIPTIONS: tuple[SmartHeatBinaryDescription, ...] = (
    SmartHeatBinaryDescription(
        key="presence",
        translation_key="presence",
        device_class=BinarySensorDeviceClass.OCCUPANCY,
        value_fn=lambda data: data.decision.presence is Presence.HOME,
        attrs_fn=lambda data: {
            "confirmed": str(data.decision.presence),
            "raw": str(data.presence_raw),
        },
    ),
    SmartHeatBinaryDescription(
        key="fault",
        translation_key="fault",
        device_class=BinarySensorDeviceClass.PROBLEM,
        value_fn=lambda data: bool(data.decision.faults),
        attrs_fn=lambda data: {
            "faults": [str(fault) for fault in data.decision.faults]
        },
    ),
    SmartHeatBinaryDescription(
        key="heatpump_available",
        translation_key="heatpump_available",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda data: data.heatpump.available,
    ),
    SmartHeatBinaryDescription(
        key="radiator_available",
        translation_key="radiator_available",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        value_fn=lambda data: data.radiator.available,
    ),
    SmartHeatBinaryDescription(
        key="temperature_stale",
        translation_key="temperature_stale",
        device_class=BinarySensorDeviceClass.PROBLEM,
        value_fn=lambda data: (
            _any(Fault.TEMPERATURE_STALE)(data) or _any(Fault.TEMPERATURE_MISSING)(data)
        ),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator: SmartHeatCoordinator = hass.data[DOMAIN][entry.entry_id]
    entities: list[BinarySensorEntity] = [
        SmartHeatBinarySensor(coordinator, description) for description in DESCRIPTIONS
    ]
    entities.append(SmartHeatPowerAnomalySensor(coordinator))
    async_add_entities(entities)


class SmartHeatBinarySensor(SmartHeatEntity, BinarySensorEntity):
    """Generic binary projection of the coordinator state."""

    entity_description: SmartHeatBinaryDescription

    def __init__(
        self,
        coordinator: SmartHeatCoordinator,
        description: SmartHeatBinaryDescription,
    ) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{description.key}"

    @property
    def is_on(self) -> bool | None:
        if self.coordinator.data is None:
            return None
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, object] | None:
        if self.coordinator.data is None or self.entity_description.attrs_fn is None:
            return None
        return dict(self.entity_description.attrs_fn(self.coordinator.data))


class SmartHeatPowerAnomalySensor(SmartHeatEntity, BinarySensorEntity):
    """True when measured power contradicts the expected radiator state.

    Detects two failure modes required by the specification: the radiator
    drawing power while the controller wants it off, and the plug reporting ON
    while the meter reads zero.
    """

    _attr_translation_key = "power_anomaly"
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(self, coordinator: SmartHeatCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.entry.entry_id}_power_anomaly"

    @property
    def is_on(self) -> bool | None:
        data = self.coordinator.data
        if data is None or data.radiator.power_w is None:
            return None

        power = data.radiator.power_w
        nominal = float(
            self.coordinator.config_data.get(
                CONF_SUPPLEMENTARY_NOMINAL_POWER, 800.0
            )
        )
        state = self.coordinator.zone_state
        if not self._controls_radiator(data):
            # Nobody asked the controller to run the radiator, so measured power
            # cannot contradict an expectation.
            return False

        if not state.radiator_on and power > 5.0:
            return True
        if state.radiator_on and power <= 0.5 and state.radiator_changed_at is not None:
            elapsed = data.snapshot.now - state.radiator_changed_at
            if elapsed.total_seconds() > 300:
                return True
        return power > nominal * POWER_TOLERANCE

    def _controls_radiator(self, data: ZoneData) -> bool:
        """False when the mode or a manual plug override leaves it to the user."""
        if data.decision.effective_mode in (Mode.MANUAL, Mode.DISABLED):
            return False
        return not self.coordinator.zone_state.radiator_manual

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        data = self.coordinator.data
        if data is None:
            return {}
        return {
            "power_w": data.radiator.power_w,
            "expected_on": (
                self.coordinator.zone_state.radiator_on
                if self._controls_radiator(data)
                else None
            ),
            "nominal_power_w": self.coordinator.config_data.get(
                CONF_SUPPLEMENTARY_NOMINAL_POWER
            ),
        }
