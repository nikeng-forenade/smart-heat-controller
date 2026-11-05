# Troubleshooting

## The card does not appear

1. Confirm the integration loaded: **Settings → Devices & Services → Smart Heat
   Controller** should show a device named after the zone.
2. Confirm the bundle exists:
   `config/custom_components/smart_heat_controller/frontend/dist/smart-heat-controller.js`.
   If it is missing, run `npm install && npm run build` in the `frontend` folder
   and restart Home Assistant.
3. Check that the browser loaded `/smart_heat_controller/smart-heat-controller.js`
   (Network tab). A 404 means the integration did not register the static path.
4. Hard-refresh the browser (Shift+Reload); the bundle is cached.

## "Radiator savings only — heat pump electricity not included"

No Mitsubishi energy sensor is configured. Open the integration options →
**Energimätning** and select the cumulative `Energy consumed` entity. Until then
the savings comparison deliberately covers the radiator only.

## "Daily energy consumed" is `unavailable`

That entity is **not required**. Smart Heat Controller derives daily values from
the cumulative meter. Do not select the unavailable daily sensor; select the
cumulative one.

## Energy shows `incomplete`

The ledger marks a day incomplete when:

- a counter reading was missing for longer than the gap tolerance (2 h), or
- the day has no readings at all.

This is intentional: a gap is never reported as zero consumption. Check the
recorder history of the energy sensor for outages.

## Radiator does not switch

- `binary_sensor.*_radiator_available` must be `on`.
- Minimum ON/OFF times block non-safety changes; check
  `sensor.*_last_decision` for `..._blocked_by_min_runtime`.
- `switch.*_dry_run` must be `off`.
- Mode `Disabled` or `Manual` never commands the radiator.

## Temperature is stale

`sensor.*_last_decision` shows `fallback_temperature_...` and
`binary_sensor.*_temperature_stale` is `on`. Verify the configured room sensor is
updating, or that the heat pump exposes `current_temperature`. Increase the
stale timeout in **Options → Temperatures and timing** if the source updates
slowly.

## Mode keeps flipping to Away

Increase **Absence delay** in **Options → Presence**. A brief WiFi dropout should
not flip the zone; if it does, the presence entity is reporting `not_home`
rather than `unavailable`. Add a second corroborating entity (person or the
mobile-app sensor).

## Heat pump setpoint is not changed

By design, the setpoint is left alone when:

- the room temperature is missing or stale, or
- the heat pump is unavailable, or
- the target equals the last commanded value (no repeat calls).

`sensor.*_last_decision` explains the current reason.

## Running the tests on Windows

Home Assistant's test harness targets Linux. `pytest-homeassistant-custom-component`
pulls in `homeassistant.runner`, which imports the POSIX-only `fcntl` module, and
the socket guard rejects the AF_INET socket pair Windows uses for the asyncio
self-pipe.

Two shims make the suite runnable locally:

1. `fcntl.py` and `resource.py` stubs inside the virtual environment's
   `site-packages` (never committed).
2. `tests/conftest.py` wraps `socket.socketpair` so only the event loop's own
   pipe is allowed.

For CI and for authoritative results, run the suite on Linux (GitHub Actions
workflow included). The shims are test-environment only and do not affect the
integration.

## Debug logging

```yaml
logger:
  logs:
    custom_components.smart_heat_controller: debug
```

Diagnostics: **Settings → Devices & Services → Smart Heat Controller → ⋮ →
Download diagnostics** (image URLs are redacted).
