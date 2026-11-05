"""Diagnostics support for Smart Heat Controller."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import SmartHeatCoordinator

TO_REDACT = {"image_url", "latitude", "longitude"}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    coordinator: SmartHeatCoordinator = hass.data[DOMAIN][entry.entry_id]
    data = coordinator.data
    return {
        "entry": {
            "title": entry.title,
            "data": async_redact_data(dict(entry.data), TO_REDACT),
            "options": async_redact_data(dict(entry.options), TO_REDACT),
        },
        "zone_state": coordinator.zone_state.as_dict(),
        "baseline": coordinator.baseline.as_dict(),
        "ledger": coordinator.ledger.as_dict(),
        "runtime": {
            "mode": str(data.decision.mode) if data else None,
            "effective_mode": str(data.decision.effective_mode) if data else None,
            "reason": data.decision.reason if data else None,
            "presence": str(data.decision.presence) if data else None,
            "presence_raw": str(data.presence_raw) if data else None,
            "faults": [str(fault) for fault in data.decision.faults] if data else [],
            "dry_run": data.decision.dry_run if data else None,
            "room_temperature": data.snapshot.room_temperature if data else None,
            "outside_temperature": data.outside_temperature if data else None,
            "radiator": {
                "power_w": data.radiator.power_w,
                "kwh_today": data.radiator.kwh_today,
                "quality": data.radiator.quality,
            }
            if data
            else None,
            "heatpump": {
                "power_w": data.heatpump.power_w,
                "kwh_today": data.heatpump.kwh_today,
                "quality": data.heatpump.quality,
            }
            if data
            else None,
            "price": data.price.as_dict() if hasattr(data.price, "as_dict") else None,
            "last_updated": data.last_updated.isoformat() if data and data.last_updated else None,
        },
    }
