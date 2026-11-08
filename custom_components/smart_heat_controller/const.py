"""Constants for the Smart Heat Controller integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "smart_heat_controller"
NAME: Final = "Smart Heat Controller"
VERSION: Final = "0.1.5"

PLATFORMS: Final = (
    "binary_sensor",
    "button",
    "climate",
    "number",
    "select",
    "sensor",
    "switch",
)

STORAGE_VERSION: Final = 1
STORAGE_KEY: Final = f"{DOMAIN}.state"

DEFAULT_NAME: Final = "Smart Heat"

# --- Defaults from the specification (section 3, step 6) -------------------
DEFAULT_HOME_TARGET: Final = 21.0
DEFAULT_AWAY_TARGET: Final = 18.0
DEFAULT_RADIATOR_ON_BELOW: Final = 19.0
DEFAULT_RADIATOR_OFF_ABOVE: Final = 20.0
DEFAULT_MIN_SAFETY_TEMP: Final = 16.0

DEFAULT_HYSTERESIS: Final = 0.5
DEFAULT_MIN_ON_MINUTES: Final = 10
DEFAULT_MIN_OFF_MINUTES: Final = 10

DEFAULT_NOMINAL_POWER: Final = 800.0
DEFAULT_TEMPERATURE_OFFSET: Final = 0.0
DEFAULT_STALE_TIMEOUT_MINUTES: Final = 30
DEFAULT_ABSENCE_DELAY_MINUTES: Final = 30
DEFAULT_ARRIVAL_CONFIRM_MINUTES: Final = 0
DEFAULT_BOOST_DURATION_MINUTES: Final = 60
DEFAULT_BOOST_OFFSET: Final = 2.0
DEFAULT_ALL_IN_PRICE_UNSET: Final = None
DEFAULT_COMFORT_OFFSET: Final = 1.0
DEFAULT_ECO_OFFSET: Final = -1.0

MIN_TARGET_TEMP: Final = 5.0
MAX_TARGET_TEMP: Final = 30.0
MIN_TEMPERATURE_STEP: Final = 0.1

# --- Configuration keys ----------------------------------------------------
CONF_ZONE_NAME: Final = "zone_name"
CONF_AREA: Final = "area"
CONF_IMAGE_URL: Final = "image_url"
CONF_PRIMARY_CLIMATE: Final = "primary_climate"
CONF_SUPPLEMENTARY_SWITCHES: Final = "supplementary_switches"
CONF_SUPPLEMENTARY_POWER_SENSOR: Final = "supplementary_power_sensor"
CONF_SUPPLEMENTARY_ENERGY_SENSOR: Final = "supplementary_energy_sensor"
CONF_SUPPLEMENTARY_NOMINAL_POWER: Final = "supplementary_nominal_power"
CONF_HEATPUMP_POWER_SENSOR: Final = "heatpump_power_sensor"
CONF_HEATPUMP_ENERGY_SENSOR: Final = "heatpump_energy_sensor"
CONF_TEMPERATURE_SENSOR: Final = "temperature_sensor"
CONF_OUTSIDE_TEMPERATURE_SENSOR: Final = "outside_temperature_sensor"
CONF_TEMPERATURE_OFFSET: Final = "temperature_offset"
CONF_STALE_TIMEOUT: Final = "stale_timeout"
CONF_PRESENCE_ENTITIES: Final = "presence_entities"
CONF_ABSENCE_DELAY: Final = "absence_delay"
CONF_ARRIVAL_CONFIRM: Final = "arrival_confirm"
CONF_UNKNOWN_BEHAVIOR: Final = "unknown_behavior"
CONF_FALLBACK_RADIATOR: Final = "fallback_radiator"
CONF_BACKUP_HEATING: Final = "backup_heating"
CONF_HOME_TARGET: Final = "home_target"
CONF_AWAY_TARGET: Final = "away_target"
CONF_RADIATOR_ON_BELOW: Final = "radiator_on_below"
CONF_RADIATOR_OFF_ABOVE: Final = "radiator_off_above"
CONF_MIN_SAFETY_TEMP: Final = "min_safety_temp"
CONF_HYSTERESIS: Final = "hysteresis"
CONF_MIN_ON_MINUTES: Final = "min_on_minutes"
CONF_MIN_OFF_MINUTES: Final = "min_off_minutes"
CONF_BOOST_DURATION: Final = "boost_duration"
CONF_DRY_RUN: Final = "dry_run"
CONF_PRICE_SENSOR: Final = "price_sensor"
CONF_ALL_IN_PRICE: Final = "all_in_price"
CONF_PRICE_OPTIMIZATION: Final = "price_optimization"
CONF_PRICE_CHEAP: Final = "price_cheap"
CONF_PRICE_EXPENSIVE: Final = "price_expensive"
CONF_PRICE_MAX_ADJUST: Final = "price_max_adjust"
CONF_PRICE_MIN_COMFORT: Final = "price_min_comfort"

CONF_SCHEDULE: Final = "schedule"
CONF_VACATION_START: Final = "vacation_start"
CONF_VACATION_END: Final = "vacation_end"
CONF_PANEL_ENABLED: Final = "panel_enabled"

DEFAULT_PRICE_MAX_ADJUST: Final = 1.0
DEFAULT_PRICE_MIN_COMFORT: Final = 18.0
DEFAULT_PANEL_ENABLED: Final = True
PANEL_URL_PATH: Final = "smart-heat"
PANEL_COMPONENT: Final = "smart-heat-panel"

# --- Services --------------------------------------------------------------
SERVICE_START_BASELINE: Final = "start_baseline"
SERVICE_STOP_BASELINE: Final = "stop_baseline"
SERVICE_EXPORT_CSV: Final = "export_csv"
SERVICE_SET_MODE: Final = "set_mode"
SERVICE_SET_OVERRIDE: Final = "set_override"
SERVICE_CLEAR_OVERRIDE: Final = "clear_override"

ATTR_ENTRY_ID: Final = "entry_id"
ATTR_MODE: Final = "mode"
ATTR_DURATION: Final = "duration"

# --- Data quality ----------------------------------------------------------
QUALITY_MEASURED: Final = "measured"
QUALITY_ESTIMATED: Final = "estimated"
QUALITY_INCOMPLETE: Final = "incomplete"
QUALITY_MISSING: Final = "missing"

SOURCE_RADIATOR: Final = "radiator"
SOURCE_HEATPUMP: Final = "heatpump"
SOURCE_TOTAL: Final = "total"

# Max samples kept in the rolling energy ledger (days).
LEDGER_RETENTION_DAYS: Final = 400

# A cumulative counter is considered repaired after this many days of
# monotonic readings following a detected reset.
COUNTER_RESET_GRACE_SECONDS: Final = 0
