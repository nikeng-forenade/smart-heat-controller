"""Config and options flows for Smart Heat Controller.

The wizard follows the seven steps from the specification and validates every
entity the user selects: existence, availability, device class and units.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import selector

from .const import (
    CONF_ABSENCE_DELAY,
    CONF_ALL_IN_PRICE,
    CONF_AREA,
    CONF_ARRIVAL_CONFIRM,
    CONF_AWAY_TARGET,
    CONF_BACKUP_HEATING,
    CONF_BOOST_DURATION,
    CONF_DRY_RUN,
    CONF_FALLBACK_RADIATOR,
    CONF_HEATPUMP_ENERGY_SENSOR,
    CONF_HEATPUMP_POWER_SENSOR,
    CONF_HOME_TARGET,
    CONF_HYSTERESIS,
    CONF_IMAGE_URL,
    CONF_MIN_OFF_MINUTES,
    CONF_MIN_ON_MINUTES,
    CONF_MIN_SAFETY_TEMP,
    CONF_OUTSIDE_TEMPERATURE_SENSOR,
    CONF_PANEL_ENABLED,
    CONF_PRICE_OPTIMIZATION,
    CONF_PRICE_SENSOR,
    CONF_PRICE_SURCHARGE,
    CONF_PRIMARY_CLIMATE,
    CONF_PRESENCE_ENTITIES,
    CONF_RADIATOR_OFF_ABOVE,
    CONF_RADIATOR_ON_BELOW,
    CONF_STALE_TIMEOUT,
    CONF_SUPPLEMENTARY_ENERGY_SENSOR,
    CONF_SUPPLEMENTARY_NOMINAL_POWER,
    CONF_SUPPLEMENTARY_POWER_SENSOR,
    CONF_SUPPLEMENTARY_SWITCHES,
    CONF_TEMPERATURE_OFFSET,
    CONF_TEMPERATURE_SENSOR,
    CONF_UNKNOWN_BEHAVIOR,
    CONF_ZONE_NAME,
    DEFAULT_ABSENCE_DELAY_MINUTES,
    DEFAULT_ARRIVAL_CONFIRM_MINUTES,
    DEFAULT_AWAY_TARGET,
    DEFAULT_BOOST_DURATION_MINUTES,
    DEFAULT_HOME_TARGET,
    DEFAULT_HYSTERESIS,
    DEFAULT_MIN_OFF_MINUTES,
    DEFAULT_MIN_ON_MINUTES,
    DEFAULT_MIN_SAFETY_TEMP,
    DEFAULT_NOMINAL_POWER,
    DEFAULT_PANEL_ENABLED,
    DEFAULT_RADIATOR_OFF_ABOVE,
    DEFAULT_RADIATOR_ON_BELOW,
    DEFAULT_STALE_TIMEOUT_MINUTES,
    DEFAULT_TEMPERATURE_OFFSET,
    DOMAIN,
    MAX_TARGET_TEMP,
    MIN_TARGET_TEMP,
)
from .controller import BackupHeating, FallbackRadiator, UnknownPresenceBehaviour

ENERGY_UNITS = ("Wh", "kWh", "MWh")
POWER_UNITS = ("W", "kW")

TEMP_SELECTOR = selector.NumberSelector(
    selector.NumberSelectorConfig(
        min=MIN_TARGET_TEMP,
        max=MAX_TARGET_TEMP,
        step=0.1,
        unit_of_measurement="°C",
        mode=selector.NumberSelectorMode.BOX,
    )
)


def _validate_band(on_below: float, off_above: float, hysteresis: float) -> str | None:
    """Return an error key when the radiator band is not sensible."""
    if off_above <= on_below:
        return "off_above_must_exceed_on_below"
    if off_above - on_below < hysteresis:
        return "hysteresis_too_large_for_band"
    return None


def _validate_targets(
    home_target: float, away_target: float, min_safety: float
) -> str | None:
    if away_target > home_target:
        return "away_target_above_home_target"
    if min_safety > away_target:
        return "safety_above_away_target"
    return None


def _entity_unit(hass: HomeAssistant, entity_id: str | None) -> tuple[str | None, str | None]:
    """Return (unit, device_class) for an entity, or (None, None)."""
    if not entity_id:
        return None, None
    state = hass.states.get(entity_id)
    if state is None:
        return None, None
    attrs = state.attributes
    return attrs.get("unit_of_measurement"), attrs.get("device_class")


@callback
def _validate_energy_entity(hass: HomeAssistant, entity_id: str | None) -> str | None:
    if not entity_id:
        return None
    state = hass.states.get(entity_id)
    if state is None:
        return "entity_not_found"
    unit, device_class = _entity_unit(hass, entity_id)
    if device_class != "energy" and (unit not in ENERGY_UNITS):
        return "not_an_energy_sensor"
    if unit not in ENERGY_UNITS:
        return "unsupported_energy_unit"
    state_class = state.attributes.get("state_class")
    if state_class not in ("total", "total_increasing"):
        return "energy_sensor_needs_total_state_class"
    return None


def _optional_default(current: dict[str, Any], key: str) -> Any:
    """Default for an optional field in the options flow.

    ``None`` is not a valid value for most selectors, so an unconfigured option
    must leave the field without a default instead of defaulting to ``None``.
    Without this the whole step is unsaveable while the field is empty.
    """
    value = current.get(key)
    return vol.UNDEFINED if value is None else value


@callback
def _validate_power_entity(hass: HomeAssistant, entity_id: str | None) -> str | None:
    if not entity_id:
        return None
    state = hass.states.get(entity_id)
    if state is None:
        return "entity_not_found"
    unit, device_class = _entity_unit(hass, entity_id)
    if device_class != "power" and state.attributes.get("device_class") is None:
        return "not_a_power_sensor"
    if unit not in POWER_UNITS:
        return "unsupported_power_unit"
    return None


class SmartHeatConfigFlow(ConfigFlow, domain=DOMAIN):
    """Seven step setup wizard."""

    VERSION = 1

    def __init__(self) -> None:
        self._data: dict[str, Any] = {}

    # -- Step 1: zone -------------------------------------------------------
    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            self._data.update(user_input)
            return await self.async_step_primary()

        schema = vol.Schema(
            {
                vol.Required(CONF_ZONE_NAME, default="Sagas hus"): selector.TextSelector(),
                vol.Optional(CONF_AREA): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=1,
                        max=2000,
                        step=1,
                        unit_of_measurement="m²",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(CONF_IMAGE_URL): selector.TextSelector(
                    selector.TextSelectorConfig(type=selector.TextSelectorType.URL)
                ),
            }
        )
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    # -- Step 2: primary heater --------------------------------------------
    async def async_step_primary(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            entity_id = user_input.get(CONF_PRIMARY_CLIMATE)
            if entity_id and self.hass.states.get(entity_id) is None:
                errors["base"] = "entity_not_found"
            else:
                self._data.update(user_input)
                return await self.async_step_supplementary()

        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_PRIMARY_CLIMATE,
                    default=self._data.get(CONF_PRIMARY_CLIMATE, vol.UNDEFINED),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="climate")
                ),
            }
        )
        return self.async_show_form(step_id="primary", data_schema=schema, errors=errors)

    # -- Step 3: supplementary heater --------------------------------------
    async def async_step_supplementary(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            if error := _validate_power_entity(
                self.hass, user_input.get(CONF_SUPPLEMENTARY_POWER_SENSOR)
            ):
                errors["base"] = error
            elif error := _validate_energy_entity(
                self.hass, user_input.get(CONF_SUPPLEMENTARY_ENERGY_SENSOR)
            ):
                errors["base"] = error
            else:
                self._data.update(user_input)
                return await self.async_step_temperature()

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_SUPPLEMENTARY_SWITCHES,
                    default=self._data.get(CONF_SUPPLEMENTARY_SWITCHES, []),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="switch", multiple=True)
                ),
                vol.Optional(
                    CONF_SUPPLEMENTARY_POWER_SENSOR,
                    default=self._data.get(CONF_SUPPLEMENTARY_POWER_SENSOR, vol.UNDEFINED),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(
                        domain="sensor", device_class="power"
                    )
                ),
                vol.Optional(
                    CONF_SUPPLEMENTARY_ENERGY_SENSOR,
                    default=self._data.get(CONF_SUPPLEMENTARY_ENERGY_SENSOR, vol.UNDEFINED),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(
                        domain="sensor", device_class="energy"
                    )
                ),
                vol.Required(
                    CONF_SUPPLEMENTARY_NOMINAL_POWER,
                    default=self._data.get(
                        CONF_SUPPLEMENTARY_NOMINAL_POWER, DEFAULT_NOMINAL_POWER
                    ),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=50,
                        max=3000,
                        step=10,
                        unit_of_measurement="W",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
            }
        )
        return self.async_show_form(
            step_id="supplementary", data_schema=schema, errors=errors
        )

    # -- Step 4: temperature source ----------------------------------------
    async def async_step_temperature(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            sensor = user_input.get(CONF_TEMPERATURE_SENSOR)
            if sensor is None and not self._data.get(CONF_PRIMARY_CLIMATE):
                errors["base"] = "need_temperature_source"
            elif sensor and self.hass.states.get(sensor) is None:
                errors["base"] = "entity_not_found"
            else:
                self._data.update(user_input)
                return await self.async_step_presence()

        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_TEMPERATURE_SENSOR,
                    default=self._data.get(CONF_TEMPERATURE_SENSOR, vol.UNDEFINED),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(
                        domain="sensor", device_class="temperature"
                    )
                ),
                vol.Optional(
                    CONF_OUTSIDE_TEMPERATURE_SENSOR,
                    default=self._data.get(CONF_OUTSIDE_TEMPERATURE_SENSOR, vol.UNDEFINED),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(
                        domain="sensor", device_class="temperature"
                    )
                ),
                vol.Required(
                    CONF_TEMPERATURE_OFFSET,
                    default=self._data.get(
                        CONF_TEMPERATURE_OFFSET, DEFAULT_TEMPERATURE_OFFSET
                    ),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=-10,
                        max=10,
                        step=0.1,
                        unit_of_measurement="°C",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Required(
                    CONF_STALE_TIMEOUT,
                    default=self._data.get(
                        CONF_STALE_TIMEOUT, DEFAULT_STALE_TIMEOUT_MINUTES
                    ),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=5,
                        max=240,
                        step=5,
                        unit_of_measurement="min",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
            }
        )
        return self.async_show_form(
            step_id="temperature", data_schema=schema, errors=errors
        )

    # -- Step 5: presence ---------------------------------------------------
    async def async_step_presence(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            self._data.update(user_input)
            return await self.async_step_temperatures()

        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_PRESENCE_ENTITIES,
                    default=self._data.get(CONF_PRESENCE_ENTITIES, []),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(
                        domain=["device_tracker", "person", "binary_sensor", "input_boolean"],
                        multiple=True,
                    )
                ),
                vol.Required(
                    CONF_ABSENCE_DELAY,
                    default=self._data.get(
                        CONF_ABSENCE_DELAY, DEFAULT_ABSENCE_DELAY_MINUTES
                    ),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=1440,
                        step=5,
                        unit_of_measurement="min",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Required(
                    CONF_ARRIVAL_CONFIRM,
                    default=self._data.get(
                        CONF_ARRIVAL_CONFIRM, DEFAULT_ARRIVAL_CONFIRM_MINUTES
                    ),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=60,
                        step=1,
                        unit_of_measurement="min",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Required(
                    CONF_UNKNOWN_BEHAVIOR,
                    default=self._data.get(
                        CONF_UNKNOWN_BEHAVIOR, UnknownPresenceBehaviour.KEEP_LAST.value
                    ),
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[item.value for item in UnknownPresenceBehaviour],
                        translation_key="unknown_behavior",
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )
        return self.async_show_form(
            step_id="presence", data_schema=schema
        )

    # -- Step 6: temperatures and safeguards -------------------------------
    async def async_step_temperatures(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        defaults = {
            CONF_HOME_TARGET: DEFAULT_HOME_TARGET,
            CONF_AWAY_TARGET: DEFAULT_AWAY_TARGET,
            CONF_RADIATOR_ON_BELOW: DEFAULT_RADIATOR_ON_BELOW,
            CONF_RADIATOR_OFF_ABOVE: DEFAULT_RADIATOR_OFF_ABOVE,
            CONF_MIN_SAFETY_TEMP: DEFAULT_MIN_SAFETY_TEMP,
            CONF_HYSTERESIS: DEFAULT_HYSTERESIS,
            CONF_MIN_ON_MINUTES: DEFAULT_MIN_ON_MINUTES,
            CONF_MIN_OFF_MINUTES: DEFAULT_MIN_OFF_MINUTES,
            **self._data,
        }

        if user_input is not None:
            error = _validate_targets(
                user_input[CONF_HOME_TARGET],
                user_input[CONF_AWAY_TARGET],
                user_input[CONF_MIN_SAFETY_TEMP],
            ) or _validate_band(
                user_input[CONF_RADIATOR_ON_BELOW],
                user_input[CONF_RADIATOR_OFF_ABOVE],
                user_input[CONF_HYSTERESIS],
            )
            if error:
                errors["base"] = error
            else:
                self._data.update(user_input)
                return await self.async_step_review()

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_HOME_TARGET, default=defaults[CONF_HOME_TARGET]
                ): TEMP_SELECTOR,
                vol.Required(
                    CONF_AWAY_TARGET, default=defaults[CONF_AWAY_TARGET]
                ): TEMP_SELECTOR,
                vol.Required(
                    CONF_RADIATOR_ON_BELOW, default=defaults[CONF_RADIATOR_ON_BELOW]
                ): TEMP_SELECTOR,
                vol.Required(
                    CONF_RADIATOR_OFF_ABOVE, default=defaults[CONF_RADIATOR_OFF_ABOVE]
                ): TEMP_SELECTOR,
                vol.Required(
                    CONF_MIN_SAFETY_TEMP, default=defaults[CONF_MIN_SAFETY_TEMP]
                ): TEMP_SELECTOR,
                vol.Required(
                    CONF_HYSTERESIS, default=defaults[CONF_HYSTERESIS]
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0.1,
                        max=3.0,
                        step=0.1,
                        unit_of_measurement="°C",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Required(
                    CONF_MIN_ON_MINUTES, default=defaults[CONF_MIN_ON_MINUTES]
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=120,
                        step=1,
                        unit_of_measurement="min",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Required(
                    CONF_MIN_OFF_MINUTES, default=defaults[CONF_MIN_OFF_MINUTES]
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=120,
                        step=1,
                        unit_of_measurement="min",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
            }
        )
        return self.async_show_form(
            step_id="temperatures", data_schema=schema, errors=errors
        )

    # -- Step 7: review -----------------------------------------------------
    async def async_step_review(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            data = {**self._data, CONF_DRY_RUN: user_input.get(CONF_DRY_RUN, True)}
            return self.async_create_entry(
                title=data.get(CONF_ZONE_NAME, "Smart Heat"), data=data
            )

        summary = (
            f"Zon: {self._data.get(CONF_ZONE_NAME, '-')}\n"
            f"Värmepump: {self._data.get(CONF_PRIMARY_CLIMATE, 'ingen')}\n"
            f"Element: {', '.join(self._data.get(CONF_SUPPLEMENTARY_SWITCHES, [])) or 'inga'}\n"
            f"Temperaturkälla: {self._data.get(CONF_TEMPERATURE_SENSOR, 'värmepumpens givare')}\n"
            f"Närvaro: {', '.join(self._data.get(CONF_PRESENCE_ENTITIES, [])) or 'ingen'}\n"
            f"Hemma {self._data.get(CONF_HOME_TARGET)} °C / Borta "
            f"{self._data.get(CONF_AWAY_TARGET)} °C / Säkerhet "
            f"{self._data.get(CONF_MIN_SAFETY_TEMP)} °C"
        )
        schema = vol.Schema(
            {vol.Required(CONF_DRY_RUN, default=True): selector.BooleanSelector()}
        )
        return self.async_show_form(
            step_id="review",
            data_schema=schema,
            description_placeholders={"summary": summary},
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return SmartHeatOptionsFlow()


class SmartHeatOptionsFlow(OptionsFlow):
    """Menu driven options flow."""

    def _merged(self) -> dict[str, Any]:
        return {**self.config_entry.data, **self.config_entry.options}

    async def _save(self, updates: dict[str, Any]) -> ConfigFlowResult:
        merged = {**self.config_entry.options, **updates}
        return self.async_create_entry(title="", data=merged)

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self.async_show_menu(
            step_id="init",
            menu_options=[
                "general",
                "temperatures",
                "presence",
                "energy",
                "safety",
                "price",
            ],
        )

    async def async_step_general(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        current = self._merged()
        if user_input is not None:
            return await self._save(user_input)

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_PANEL_ENABLED,
                    default=current.get(CONF_PANEL_ENABLED, DEFAULT_PANEL_ENABLED),
                ): selector.BooleanSelector(),
            }
        )
        return self.async_show_form(step_id="general", data_schema=schema)

    async def async_step_temperatures(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        current = self._merged()
        if user_input is not None:
            error = _validate_targets(
                user_input[CONF_HOME_TARGET],
                user_input[CONF_AWAY_TARGET],
                user_input[CONF_MIN_SAFETY_TEMP],
            ) or _validate_band(
                user_input[CONF_RADIATOR_ON_BELOW],
                user_input[CONF_RADIATOR_OFF_ABOVE],
                user_input[CONF_HYSTERESIS],
            )
            if error:
                errors["base"] = error
            else:
                return await self._save(user_input)

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_HOME_TARGET, default=current.get(CONF_HOME_TARGET)
                ): TEMP_SELECTOR,
                vol.Required(
                    CONF_AWAY_TARGET, default=current.get(CONF_AWAY_TARGET)
                ): TEMP_SELECTOR,
                vol.Required(
                    CONF_RADIATOR_ON_BELOW, default=current.get(CONF_RADIATOR_ON_BELOW)
                ): TEMP_SELECTOR,
                vol.Required(
                    CONF_RADIATOR_OFF_ABOVE, default=current.get(CONF_RADIATOR_OFF_ABOVE)
                ): TEMP_SELECTOR,
                vol.Required(
                    CONF_MIN_SAFETY_TEMP, default=current.get(CONF_MIN_SAFETY_TEMP)
                ): TEMP_SELECTOR,
                vol.Required(
                    CONF_HYSTERESIS, default=current.get(CONF_HYSTERESIS)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0.1, max=3.0, step=0.1, unit_of_measurement="°C"
                    )
                ),
                vol.Required(
                    CONF_MIN_ON_MINUTES, default=current.get(CONF_MIN_ON_MINUTES)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0, max=120, step=1, unit_of_measurement="min"
                    )
                ),
                vol.Required(
                    CONF_MIN_OFF_MINUTES, default=current.get(CONF_MIN_OFF_MINUTES)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0, max=120, step=1, unit_of_measurement="min"
                    )
                ),
            }
        )
        return self.async_show_form(
            step_id="temperatures", data_schema=schema, errors=errors
        )

    async def async_step_presence(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        current = self._merged()
        if user_input is not None:
            return await self._save(user_input)

        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_PRESENCE_ENTITIES,
                    default=current.get(CONF_PRESENCE_ENTITIES, []),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(
                        domain=["device_tracker", "person", "binary_sensor", "input_boolean"],
                        multiple=True,
                    )
                ),
                vol.Required(
                    CONF_ABSENCE_DELAY, default=current.get(CONF_ABSENCE_DELAY)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0, max=1440, step=5, unit_of_measurement="min"
                    )
                ),
                vol.Required(
                    CONF_ARRIVAL_CONFIRM, default=current.get(CONF_ARRIVAL_CONFIRM)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0, max=60, step=1, unit_of_measurement="min"
                    )
                ),
                vol.Required(
                    CONF_UNKNOWN_BEHAVIOR, default=current.get(CONF_UNKNOWN_BEHAVIOR)
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[item.value for item in UnknownPresenceBehaviour],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )
        return self.async_show_form(step_id="presence", data_schema=schema)

    async def async_step_energy(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        current = self._merged()
        errors: dict[str, str] = {}
        if user_input is not None:
            if error := _validate_power_entity(
                self.hass, user_input.get(CONF_SUPPLEMENTARY_POWER_SENSOR)
            ):
                errors["base"] = error
            elif error := _validate_energy_entity(
                self.hass, user_input.get(CONF_SUPPLEMENTARY_ENERGY_SENSOR)
            ):
                errors["base"] = error
            elif error := _validate_energy_entity(
                self.hass, user_input.get(CONF_HEATPUMP_ENERGY_SENSOR)
            ):
                errors["base"] = error
            elif error := _validate_power_entity(
                self.hass, user_input.get(CONF_HEATPUMP_POWER_SENSOR)
            ):
                errors["base"] = error
            else:
                return await self._save(user_input)

        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_SUPPLEMENTARY_POWER_SENSOR,
                    default=_optional_default(current, CONF_SUPPLEMENTARY_POWER_SENSOR),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor", device_class="power")
                ),
                vol.Optional(
                    CONF_SUPPLEMENTARY_ENERGY_SENSOR,
                    default=_optional_default(current, CONF_SUPPLEMENTARY_ENERGY_SENSOR),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor", device_class="energy")
                ),
                vol.Optional(
                    CONF_HEATPUMP_POWER_SENSOR,
                    default=_optional_default(current, CONF_HEATPUMP_POWER_SENSOR),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor", device_class="power")
                ),
                vol.Optional(
                    CONF_HEATPUMP_ENERGY_SENSOR,
                    default=_optional_default(current, CONF_HEATPUMP_ENERGY_SENSOR),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor", device_class="energy")
                ),
            }
        )
        return self.async_show_form(step_id="energy", data_schema=schema, errors=errors)

    async def async_step_safety(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        current = self._merged()
        if user_input is not None:
            return await self._save(user_input)

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_FALLBACK_RADIATOR,
                    default=current.get(
                        CONF_FALLBACK_RADIATOR, FallbackRadiator.HOLD.value
                    ),
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[item.value for item in FallbackRadiator],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Required(
                    CONF_BACKUP_HEATING,
                    default=current.get(CONF_BACKUP_HEATING, BackupHeating.NONE.value),
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[item.value for item in BackupHeating],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Required(
                    CONF_DRY_RUN, default=current.get(CONF_DRY_RUN, False)
                ): selector.BooleanSelector(),
            }
        )
        return self.async_show_form(step_id="safety", data_schema=schema)

    async def async_step_price(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        current = self._merged()
        if user_input is not None:
            return await self._save(user_input)

        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_PRICE_SENSOR,
                    default=_optional_default(current, CONF_PRICE_SENSOR),
                ): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(
                    CONF_ALL_IN_PRICE,
                    default=_optional_default(current, CONF_ALL_IN_PRICE),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=20,
                        step=0.01,
                        unit_of_measurement="SEK/kWh",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_PRICE_SURCHARGE,
                    default=_optional_default(current, CONF_PRICE_SURCHARGE),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=300,
                        step=0.1,
                        unit_of_measurement="öre/kWh",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Required(
                    CONF_PRICE_OPTIMIZATION, default=current.get(CONF_PRICE_OPTIMIZATION, False)
                ): selector.BooleanSelector(),
            }
        )
        return self.async_show_form(step_id="price", data_schema=schema)
