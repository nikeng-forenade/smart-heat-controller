"""Sensor entities projecting the coordinator state."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, time

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import (
    PERCENTAGE,
    UnitOfEnergy,
    UnitOfPower,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.typing import StateType
from homeassistant.util import dt as dt_util

from .const import (
    DOMAIN,
    QUALITY_MISSING,
    SOURCE_HEATPUMP,
    SOURCE_RADIATOR,
    SOURCE_TOTAL,
)
from .coordinator import SmartHeatCoordinator, ZoneData
from .entity import SmartHeatEntity


@dataclass(frozen=True, kw_only=True)
class SmartHeatSensorDescription(SensorEntityDescription):
    """Sensor description with a value extractor."""

    value_fn: Callable[[ZoneData], StateType | datetime]
    attrs_fn: Callable[[ZoneData], dict[str, object]] | None = None


def _total(data: ZoneData, period: str, source: str):
    return data.totals.get(period, {}).get(source)


def _kwh(period: str, source: str) -> Callable[[ZoneData], float | None]:
    def _value(data: ZoneData) -> float | None:
        total = _total(data, period, source)
        if total is None or total.quality == QUALITY_MISSING:
            return None
        return round(total.kwh, 3)

    return _value


def _cost(period: str, source: str) -> Callable[[ZoneData], float | None]:
    def _value(data: ZoneData) -> float | None:
        return data.costs.get(period, {}).get(source)

    return _value


def _quality(period: str, source: str) -> Callable[[ZoneData], dict[str, object]]:
    def _attrs(data: ZoneData) -> dict[str, object]:
        total = _total(data, period, source)
        return total.as_dict() if total else {}

    return _attrs


def _price_attrs(data: ZoneData) -> dict[str, object]:
    return {
        "price_source": data.price.source,
        "price_quality": data.price.quality,
        "includes_fees": data.price.includes_fees,
        "sek_per_kwh": data.price.sek_per_kwh,
    }


SENSORS: tuple[SmartHeatSensorDescription, ...] = (
    SmartHeatSensorDescription(
        key="room_temperature",
        translation_key="room_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        suggested_display_precision=1,
        value_fn=lambda data: data.snapshot.room_temperature,
    ),
    SmartHeatSensorDescription(
        key="outside_temperature",
        translation_key="outside_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        suggested_display_precision=1,
        value_fn=lambda data: data.outside_temperature,
    ),
    SmartHeatSensorDescription(
        key="radiator_power",
        translation_key="radiator_power",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
        suggested_display_precision=0,
        value_fn=lambda data: data.radiator.power_w,
        attrs_fn=lambda data: {"quality": data.radiator.quality},
    ),
    SmartHeatSensorDescription(
        key="heatpump_power",
        translation_key="heatpump_power",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
        suggested_display_precision=0,
        value_fn=lambda data: data.heatpump.power_w,
        attrs_fn=lambda data: {"quality": data.heatpump.quality},
    ),
    SmartHeatSensorDescription(
        key="radiator_energy_today",
        translation_key="radiator_energy_today",
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=3,
        value_fn=_kwh("today", SOURCE_RADIATOR),
        attrs_fn=_quality("today", SOURCE_RADIATOR),
    ),
    SmartHeatSensorDescription(
        key="heatpump_energy_today",
        translation_key="heatpump_energy_today",
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=3,
        value_fn=_kwh("today", SOURCE_HEATPUMP),
        attrs_fn=_quality("today", SOURCE_HEATPUMP),
    ),
    SmartHeatSensorDescription(
        key="radiator_cost_today",
        translation_key="radiator_cost_today",
        device_class=SensorDeviceClass.MONETARY,
        native_unit_of_measurement="SEK",
        suggested_display_precision=2,
        value_fn=_cost("today", SOURCE_RADIATOR),
        attrs_fn=_price_attrs,
    ),
    SmartHeatSensorDescription(
        key="heatpump_cost_today",
        translation_key="heatpump_cost_today",
        device_class=SensorDeviceClass.MONETARY,
        native_unit_of_measurement="SEK",
        suggested_display_precision=2,
        value_fn=_cost("today", SOURCE_HEATPUMP),
        attrs_fn=_price_attrs,
    ),
    SmartHeatSensorDescription(
        key="heating_energy_today",
        translation_key="heating_energy_today",
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=3,
        value_fn=_kwh("today", SOURCE_TOTAL),
        attrs_fn=_quality("today", SOURCE_TOTAL),
    ),
    SmartHeatSensorDescription(
        key="heating_energy_week",
        translation_key="heating_energy_week",
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=3,
        value_fn=_kwh("week", SOURCE_TOTAL),
        attrs_fn=_quality("week", SOURCE_TOTAL),
    ),
    SmartHeatSensorDescription(
        key="heating_energy_month",
        translation_key="heating_energy_month",
        device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=3,
        value_fn=_kwh("month", SOURCE_TOTAL),
        attrs_fn=_quality("month", SOURCE_TOTAL),
    ),
    SmartHeatSensorDescription(
        key="cost_today",
        translation_key="cost_today",
        device_class=SensorDeviceClass.MONETARY,
        native_unit_of_measurement="SEK",
        suggested_display_precision=2,
        value_fn=_cost("today", SOURCE_TOTAL),
        attrs_fn=lambda data: {
            "price_source": data.price.source,
            "price_quality": data.price.quality,
            "includes_fees": data.price.includes_fees,
        },
    ),
    SmartHeatSensorDescription(
        key="cost_week",
        translation_key="cost_week",
        device_class=SensorDeviceClass.MONETARY,
        native_unit_of_measurement="SEK",
        suggested_display_precision=2,
        value_fn=_cost("week", SOURCE_TOTAL),
    ),
    SmartHeatSensorDescription(
        key="cost_month",
        translation_key="cost_month",
        device_class=SensorDeviceClass.MONETARY,
        native_unit_of_measurement="SEK",
        suggested_display_precision=2,
        value_fn=_cost("month", SOURCE_TOTAL),
    ),
    SmartHeatSensorDescription(
        key="baseline_average",
        translation_key="baseline_average",
        icon="mdi:chart-histogram",
        native_unit_of_measurement="kWh/d",
        suggested_display_precision=2,
        value_fn=lambda data: (
            round(data.savings.baseline_kwh_per_day, 2)
            if data.savings and data.savings.baseline_kwh_per_day is not None
            else None
        ),
    ),
    SmartHeatSensorDescription(
        key="comparison_average",
        translation_key="comparison_average",
        icon="mdi:chart-bar",
        native_unit_of_measurement="kWh/d",
        suggested_display_precision=2,
        value_fn=lambda data: (
            round(data.savings.comparison_kwh_per_day, 2)
            if data.savings and data.savings.comparison_kwh_per_day is not None
            else None
        ),
    ),
    SmartHeatSensorDescription(
        key="savings",
        translation_key="savings",
        icon="mdi:leaf",
        native_unit_of_measurement="kWh/d",
        suggested_display_precision=2,
        value_fn=lambda data: (
            round(data.savings.delta_kwh_per_day, 2)
            if data.savings and data.savings.delta_kwh_per_day is not None
            else None
        ),
        attrs_fn=lambda data: data.savings.as_dict() if data.savings else {},
    ),
    SmartHeatSensorDescription(
        key="data_coverage",
        translation_key="data_coverage",
        native_unit_of_measurement=PERCENTAGE,
        suggested_display_precision=0,
        value_fn=lambda data: round(
            data.totals.get("today", {}).get(SOURCE_TOTAL).coverage * 100
            if data.totals.get("today", {}).get(SOURCE_TOTAL)
            else 0
        ),
    ),
    SmartHeatSensorDescription(
        key="last_decision",
        translation_key="last_decision",
        icon="mdi:history",
        value_fn=lambda data: data.decision.reason,
        attrs_fn=lambda data: {
            "mode": str(data.decision.mode),
            "effective_mode": str(data.decision.effective_mode),
            "presence": str(data.decision.presence),
            "faults": [str(fault) for fault in data.decision.faults],
        },
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator: SmartHeatCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        SmartHeatSensor(coordinator, description) for description in SENSORS
    )


class SmartHeatSensor(SmartHeatEntity, SensorEntity):
    """A read-only projection of :class:`ZoneData`."""

    entity_description: SmartHeatSensorDescription

    def __init__(
        self,
        coordinator: SmartHeatCoordinator,
        description: SmartHeatSensorDescription,
    ) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{description.key}"

    @property
    def native_value(self) -> StateType | datetime:
        if self.coordinator.data is None:
            return None
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, object] | None:
        if self.coordinator.data is None or self.entity_description.attrs_fn is None:
            return None
        return dict(self.entity_description.attrs_fn(self.coordinator.data))

    @property
    def last_reset(self) -> datetime | None:
        """Midnight local time, so Recorder can rebuild daily statistics."""
        if self.entity_description.state_class is not SensorStateClass.TOTAL:
            return None
        today = dt_util.now().date()
        return datetime.combine(today, time.min, tzinfo=dt_util.get_default_time_zone())
