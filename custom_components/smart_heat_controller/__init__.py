"""Smart Heat Controller — Home Assistant custom integration."""

from __future__ import annotations

import logging
from datetime import timedelta
from pathlib import Path
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.frontend import (
    add_extra_js_url,
    async_panel_exists,
    async_register_built_in_panel,
    async_remove_panel,
)
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.typing import ConfigType
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_DURATION,
    ATTR_ENTRY_ID,
    ATTR_MODE,
    CONF_PANEL_ENABLED,
    CONF_PRICE_CHEAP,
    CONF_PRICE_EXPENSIVE,
    CONF_PRICE_MAX_ADJUST,
    CONF_PRICE_MIN_COMFORT,
    CONF_PRICE_OPTIMIZATION,
    DOMAIN,
    NAME,
    PANEL_COMPONENT,
    PANEL_URL_PATH,
    PLATFORMS,
    SERVICE_CLEAR_OVERRIDE,
    SERVICE_EXPORT_CSV,
    SERVICE_SET_MODE,
    SERVICE_START_BASELINE,
    SERVICE_STOP_BASELINE,
    SOURCE_HEATPUMP,
    SOURCE_RADIATOR,
    VERSION,
)
from .controller import Mode
from .coordinator import SmartHeatCoordinator
from .energy import period_days
from .schedule import Vacation, WeeklySchedule

_LOGGER = logging.getLogger(__name__)

FRONTEND_URL = "/smart_heat_controller"
FRONTEND_FILE = "smart-heat-controller.js"

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

SET_MODE_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_ENTRY_ID): cv.string,
        vol.Required(ATTR_MODE): vol.In([str(mode) for mode in Mode]),
        vol.Optional(ATTR_DURATION): vol.All(vol.Coerce(int), vol.Range(min=0, max=1440)),
    }
)

BASELINE_SCHEMA = vol.Schema({vol.Optional(ATTR_ENTRY_ID): cv.string})


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    hass.data.setdefault(DOMAIN, {})
    _async_register_services(hass)
    _async_register_websocket(hass)
    await _async_register_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    domain_data: dict[str, Any] = hass.data.setdefault(DOMAIN, {})

    coordinator = SmartHeatCoordinator(hass, entry)
    await coordinator.async_setup()

    domain_data[entry.entry_id] = coordinator

    entry.runtime_data = coordinator
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    for platform in PLATFORMS:
        await hass.config_entries.async_forward_entry_setups(entry, [platform])

    _async_register_panel(hass, coordinator)

    _LOGGER.info(
        "Smart Heat Controller %s started for zone %s (dry_run=%s)",
        VERSION,
        entry.title,
        coordinator.zone_config.dry_run,
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    coordinator: SmartHeatCoordinator | None = hass.data.get(DOMAIN, {}).pop(
        entry.entry_id, None
    )
    if coordinator is not None:
        await coordinator.async_flush()
        await coordinator.async_shutdown()

    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        _async_remove_panel_if_unused(hass)
    return unloaded


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Apply option changes live instead of reloading the entry."""
    coordinator: SmartHeatCoordinator | None = hass.data.get(DOMAIN, {}).get(
        entry.entry_id
    )
    if coordinator is None:
        return
    await coordinator.async_refresh()


# ---------------------------------------------------------------------------
# Frontend
# ---------------------------------------------------------------------------


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the card bundle and register the optional sidebar panel once."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get("frontend_registered"):
        return

    if hass.http is None:
        # Running without the HTTP component (or in a bare test harness); the
        # backend keeps working, the card and panel are simply not available.
        return

    dist = Path(__file__).parent / "frontend" / "dist"
    bundle = dist / FRONTEND_FILE

    await hass.http.async_register_static_paths(
        [StaticPathConfig(FRONTEND_URL, str(dist), True)]
    )
    domain_data["frontend_registered"] = True

    if not bundle.is_file():
        _LOGGER.warning(
            "Smart Heat Controller card bundle missing at %s; "
            "the dashboard card will not load until the frontend is built",
            bundle,
        )
        return

    if "frontend" not in hass.config.components:
        _LOGGER.debug("frontend not loaded; skipping card registration")
        return

    try:
        add_extra_js_url(hass, f"{FRONTEND_URL}/{FRONTEND_FILE}")
    except (KeyError, AttributeError):  # pragma: no cover - defensive
        _LOGGER.debug("frontend is not ready; the card was not registered")


@callback
def _async_register_panel(hass: HomeAssistant, coordinator: SmartHeatCoordinator) -> None:
    """Add a sidebar entry that renders the dashboard.

    Uses Home Assistant's own panel registration. The global sidebar is never
    overridden; this only adds one item pointing at our own view.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get("panel_registered"):
        return
    if "frontend" not in hass.config.components:
        _LOGGER.debug("frontend not loaded; skipping the sidebar panel")
        return
    if not coordinator.config_data.get(CONF_PANEL_ENABLED, True):
        return
    if async_panel_exists(hass, PANEL_URL_PATH):
        domain_data["panel_registered"] = True
        return

    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=NAME,
        sidebar_icon="mdi:fire",
        frontend_url_path=PANEL_URL_PATH,
        config={
            "_panel_custom": {
                "name": PANEL_COMPONENT,
                "embed_iframe": False,
                "trust_external": False,
                "module_url": f"{FRONTEND_URL}/{FRONTEND_FILE}",
            }
        },
        require_admin=False,
    )
    domain_data["panel_registered"] = True


@callback
def _async_remove_panel_if_unused(hass: HomeAssistant) -> None:
    """Drop the sidebar entry when the last zone is removed."""
    remaining = [
        value
        for value in hass.data.get(DOMAIN, {}).values()
        if isinstance(value, SmartHeatCoordinator)
    ]
    if remaining:
        return
    if not hass.data.get(DOMAIN, {}).get("panel_registered"):
        return
    async_remove_panel(hass, PANEL_URL_PATH)
    hass.data[DOMAIN]["panel_registered"] = False


# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------


def _resolve_coordinator(
    hass: HomeAssistant, call: ServiceCall
) -> SmartHeatCoordinator:
    entry_id = call.data.get(ATTR_ENTRY_ID)
    coordinators: dict[str, SmartHeatCoordinator] = {
        key: value
        for key, value in hass.data.get(DOMAIN, {}).items()
        if isinstance(value, SmartHeatCoordinator)
    }
    if not coordinators:
        raise HomeAssistantError("Smart Heat Controller is not configured")

    if entry_id:
        coordinator = coordinators.get(entry_id)
        if coordinator is None:
            raise HomeAssistantError(f"Unknown zone entry_id: {entry_id}")
        return coordinator

    if len(coordinators) > 1:
        raise HomeAssistantError(
            "Multiple zones configured; pass entry_id to select one"
        )
    return next(iter(coordinators.values()))


@callback
def _async_register_services(hass: HomeAssistant) -> None:
    if hass.services.has_service(DOMAIN, SERVICE_START_BASELINE):
        return

    async def _start_baseline(call: ServiceCall) -> None:
        await _resolve_coordinator(hass, call).async_start_baseline()

    async def _stop_baseline(call: ServiceCall) -> None:
        await _resolve_coordinator(hass, call).async_stop_baseline()

    async def _set_mode(call: ServiceCall) -> None:
        coordinator = _resolve_coordinator(hass, call)
        minutes = call.data.get(ATTR_DURATION)
        await coordinator.async_set_mode(
            Mode(call.data[ATTR_MODE]),
            timedelta(minutes=minutes) if minutes else None,
        )

    async def _clear_override(call: ServiceCall) -> None:
        coordinator = _resolve_coordinator(hass, call)
        await coordinator.async_set_mode(Mode.AUTO)

    async def _export_csv(call: ServiceCall) -> dict[str, str]:
        coordinator = _resolve_coordinator(hass, call)
        await coordinator.async_flush()
        target_dir = Path(hass.config.path("smart_heat_controller"))
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / f"{coordinator.entry.entry_id}_energy.csv"
        await hass.async_add_executor_job(
            target.write_text, coordinator.export_csv(), "utf-8"
        )
        return {"path": str(target)}

    hass.services.async_register(
        DOMAIN, SERVICE_START_BASELINE, _start_baseline, schema=BASELINE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_STOP_BASELINE, _stop_baseline, schema=BASELINE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_MODE, _set_mode, schema=SET_MODE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_CLEAR_OVERRIDE, _clear_override, schema=BASELINE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_EXPORT_CSV,
        _export_csv,
        schema=BASELINE_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )


# ---------------------------------------------------------------------------
# WebSocket API used by the dashboard card
# ---------------------------------------------------------------------------


@callback
def _async_register_websocket(hass: HomeAssistant) -> None:
    if hass.data.get(DOMAIN, {}).get("websocket_registered"):
        return

    @websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/zones"})
    @websocket_api.async_response
    async def _ws_zones(
        hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
    ) -> None:
        zones = [
            _zone_payload(coordinator)
            for coordinator in hass.data.get(DOMAIN, {}).values()
            if isinstance(coordinator, SmartHeatCoordinator)
        ]
        connection.send_result(msg["id"], {"zones": zones})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): f"{DOMAIN}/set_schedule",
            vol.Required(ATTR_ENTRY_ID): cv.string,
            vol.Required("enabled"): cv.boolean,
            vol.Optional("weekday", default=[]): [dict],
            vol.Optional("weekend", default=[]): [dict],
        }
    )
    @websocket_api.async_response
    async def _ws_set_schedule(
        hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
    ) -> None:
        coordinator = _coordinator_for(hass, msg[ATTR_ENTRY_ID])
        if coordinator is None:
            connection.send_error(msg["id"], "not_found", "Unknown zone")
            return
        schedule = WeeklySchedule.from_dict(
            {
                "enabled": msg["enabled"],
                "weekday": msg["weekday"],
                "weekend": msg["weekend"],
            }
        )
        await coordinator.async_set_schedule(schedule)
        connection.send_result(msg["id"], {"schedule": schedule.as_dict()})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): f"{DOMAIN}/set_vacation",
            vol.Required(ATTR_ENTRY_ID): cv.string,
            vol.Optional("start"): vol.Any(None, cv.string),
            vol.Optional("end"): vol.Any(None, cv.string),
        }
    )
    @websocket_api.async_response
    async def _ws_set_vacation(
        hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
    ) -> None:
        coordinator = _coordinator_for(hass, msg[ATTR_ENTRY_ID])
        if coordinator is None:
            connection.send_error(msg["id"], "not_found", "Unknown zone")
            return
        try:
            vacation = Vacation.from_dict(
                {"start": msg.get("start"), "end": msg.get("end")}
            )
        except ValueError:
            connection.send_error(msg["id"], "invalid_date", "Use YYYY-MM-DD")
            return
        await coordinator.async_set_vacation(vacation)
        connection.send_result(msg["id"], {"vacation": vacation.as_dict()})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): f"{DOMAIN}/set_price",
            vol.Required(ATTR_ENTRY_ID): cv.string,
            vol.Required("enabled"): cv.boolean,
            vol.Optional("cheap"): vol.Any(None, vol.Coerce(float)),
            vol.Optional("expensive"): vol.Any(None, vol.Coerce(float)),
            vol.Optional("max_adjust"): vol.Any(None, vol.Coerce(float)),
            vol.Optional("min_comfort"): vol.Any(None, vol.Coerce(float)),
        }
    )
    @websocket_api.async_response
    async def _ws_set_price(
        hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
    ) -> None:
        coordinator = _coordinator_for(hass, msg[ATTR_ENTRY_ID])
        if coordinator is None:
            connection.send_error(msg["id"], "not_found", "Unknown zone")
            return
        await coordinator.async_set_options(
            {
                CONF_PRICE_OPTIMIZATION: bool(msg["enabled"]),
                CONF_PRICE_CHEAP: msg.get("cheap"),
                CONF_PRICE_EXPENSIVE: msg.get("expensive"),
                CONF_PRICE_MAX_ADJUST: msg.get("max_adjust"),
                CONF_PRICE_MIN_COMFORT: msg.get("min_comfort"),
            }
        )
        connection.send_result(msg["id"], {"ok": True})

    websocket_api.async_register_command(hass, _ws_zones)
    websocket_api.async_register_command(hass, _ws_set_schedule)
    websocket_api.async_register_command(hass, _ws_set_vacation)
    websocket_api.async_register_command(hass, _ws_set_price)
    hass.data.setdefault(DOMAIN, {})["websocket_registered"] = True


def _coordinator_for(
    hass: HomeAssistant, entry_id: str
) -> SmartHeatCoordinator | None:
    coordinator = hass.data.get(DOMAIN, {}).get(entry_id)
    return coordinator if isinstance(coordinator, SmartHeatCoordinator) else None


ENTITY_DOMAINS: dict[str, str] = {
    "mode": "select",
    "home_target": "number",
    "away_target": "number",
    "radiator_on_below": "number",
    "radiator_off_above": "number",
    "min_safety_temp": "number",
    "hysteresis": "number",
    "min_on_minutes": "number",
    "min_off_minutes": "number",
    "dry_run": "switch",
    "presence": "binary_sensor",
    "fault": "binary_sensor",
    "heatpump_available": "binary_sensor",
    "radiator_available": "binary_sensor",
    "temperature_stale": "binary_sensor",
    "power_anomaly": "binary_sensor",
    "room_temperature": "sensor",
    "outside_temperature": "sensor",
    "radiator_power": "sensor",
    "heatpump_power": "sensor",
    "radiator_energy_today": "sensor",
    "heatpump_energy_today": "sensor",
    "radiator_cost_today": "sensor",
    "heatpump_cost_today": "sensor",
    "heating_energy_today": "sensor",
    "heating_energy_week": "sensor",
    "heating_energy_month": "sensor",
    "cost_today": "sensor",
    "cost_week": "sensor",
    "cost_month": "sensor",
    "baseline_average": "sensor",
    "comparison_average": "sensor",
    "savings": "sensor",
    "data_coverage": "sensor",
    "last_decision": "sensor",
    "start_baseline": "button",
    "stop_baseline": "button",
}


def _series(coordinator: SmartHeatCoordinator) -> dict[str, Any]:
    """Daily aggregates for the chart, straight from the bounded ledger."""
    today = dt_util.now().date()
    start, end = period_days(today, 30)
    return {
        "start": start.isoformat(),
        "end": end.isoformat(),
        "radiator": coordinator.ledger.series(SOURCE_RADIATOR, start, end),
        "heatpump": coordinator.ledger.series(SOURCE_HEATPUMP, start, end),
    }


def _entity_map(coordinator: SmartHeatCoordinator) -> dict[str, str]:
    """Resolve the integration's own entity ids for the dashboard card."""
    registry = er.async_get(coordinator.hass)
    entry_id = coordinator.entry.entry_id
    resolved: dict[str, str] = {}
    for key, domain in ENTITY_DOMAINS.items():
        entity_id = registry.async_get_entity_id(domain, DOMAIN, f"{entry_id}_{key}")
        if entity_id:
            resolved[key] = entity_id
    return resolved


def _zone_payload(coordinator: SmartHeatCoordinator) -> dict[str, Any]:
    data = coordinator.data
    if data is None:
        return {
            "entry_id": coordinator.entry.entry_id,
            "name": coordinator.zone_name,
            "available": False,
            "entities": _entity_map(coordinator),
        }

    config = coordinator.config_data
    return {
        "entry_id": coordinator.entry.entry_id,
        "name": coordinator.zone_name,
        "area": config.get("area"),
        "image_url": config.get("image_url"),
        "available": True,
        "entities": _entity_map(coordinator),
        "actuators": {
            "climate": config.get("primary_climate"),
            "switches": config.get("supplementary_switches") or [],
            "temperature_sensor": config.get("temperature_sensor"),
            "outside_sensor": config.get("outside_temperature_sensor"),
            "presence_entities": config.get("presence_entities") or [],
        },
        "mode": str(data.decision.mode),
        "effective_mode": str(data.decision.effective_mode),
        "reason": data.decision.reason,
        "presence": str(data.decision.presence),
        "presence_raw": str(data.presence_raw),
        "faults": [str(fault) for fault in data.decision.faults],
        "dry_run": data.decision.dry_run,
        "room_temperature": data.snapshot.room_temperature,
        "radiator": {
            "power_w": data.radiator.power_w,
            "kwh_today": data.radiator.kwh_today,
            "quality": data.radiator.quality,
            "available": data.radiator.available,
        },
        "heatpump": {
            "power_w": data.heatpump.power_w,
            "kwh_today": data.heatpump.kwh_today,
            "quality": data.heatpump.quality,
            "available": data.heatpump.available,
        },
        "totals": {
            period: {
                source: total.as_dict() for source, total in sources.items()
            }
            for period, sources in data.totals.items()
        },
        "costs": data.costs,
        "price": {
            "sek_per_kwh": data.price.sek_per_kwh,
            "quality": data.price.quality,
            "source": data.price.source,
            "includes_fees": data.price.includes_fees,
        },
        "savings": data.savings.as_dict() if data.savings else None,
        "savings_warning": data.savings_warning,
        "baseline": coordinator.baseline.as_dict(),
        "schedule": coordinator.schedule.as_dict(),
        "schedule_target": coordinator.schedule_target,
        "vacation": coordinator.vacation.as_dict(),
        "price_decision": {
            "offset": data.price_decision.offset,
            "state": data.price_decision.state,
            "reason": data.price_decision.reason,
        },
        "price_settings": coordinator.price_settings.as_dict(),
        "series": _series(coordinator),
        "settings": {
            "home_target": config.get("home_target"),
            "away_target": config.get("away_target"),
            "radiator_on_below": config.get("radiator_on_below"),
            "radiator_off_above": config.get("radiator_off_above"),
            "min_safety_temp": config.get("min_safety_temp"),
            "hysteresis": config.get("hysteresis"),
            "min_on_minutes": config.get("min_on_minutes"),
            "min_off_minutes": config.get("min_off_minutes"),
            "nominal_power": config.get("supplementary_nominal_power"),
            "heatpump_target": data.snapshot.heatpump_target,
            "radiator_on": data.snapshot.radiator_is_on,
        },
        "last_updated": data.last_updated.isoformat() if data.last_updated else None,
    }
