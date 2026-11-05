"""Shared fixtures for the Smart Heat Controller test suite."""

from __future__ import annotations

import socket
import sys

import pytest
import pytest_socket
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.smart_heat_controller.const import DOMAIN

pytest_plugins = ["pytest_homeassistant_custom_component"]

_real_socketpair = socket.socketpair


def _socketpair_for_event_loop(*args, **kwargs):
    """Allow asyncio's self-pipe on Windows.

    Home Assistant's test plugin blocks socket creation. On POSIX asyncio uses
    an AF_UNIX pair which is explicitly allowed; Windows has no AF_UNIX here so
    ``socketpair`` falls back to AF_INET and would be rejected. This keeps the
    guard for everything except the event loop's own pipe.
    """
    pytest_socket.enable_socket()
    try:
        return _real_socketpair(*args, **kwargs)
    finally:
        pytest_socket.disable_socket(allow_unix_socket=True)


if sys.platform == "win32":
    socket.socketpair = _socketpair_for_event_loop


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Load custom_components from this repository."""
    yield


@pytest.fixture
def entry_data() -> dict:
    return {
        "zone_name": "Sagas hus",
        "area": 15,
        "primary_climate": "climate.mitsubishi",
        "supplementary_switches": ["switch.shelly"],
        "supplementary_power_sensor": "sensor.shelly_power",
        "supplementary_energy_sensor": "sensor.shelly_energy",
        "supplementary_nominal_power": 800,
        "heatpump_energy_sensor": "sensor.mitsubishi_energy",
        "temperature_sensor": "sensor.room_temperature",
        "temperature_offset": 0.0,
        "stale_timeout": 30,
        "presence_entities": ["device_tracker.saga_phone"],
        "absence_delay": 30,
        "arrival_confirm": 0,
        "unknown_behavior": "keep_last",
        "home_target": 21.0,
        "away_target": 18.0,
        "radiator_on_below": 19.0,
        "radiator_off_above": 20.0,
        "min_safety_temp": 16.0,
        "hysteresis": 0.5,
        "min_on_minutes": 10,
        "min_off_minutes": 10,
        "dry_run": False,
    }


@pytest.fixture
def mock_entry(entry_data: dict) -> MockConfigEntry:
    return MockConfigEntry(domain=DOMAIN, title="Sagas hus", data=entry_data)
