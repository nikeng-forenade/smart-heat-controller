# Architecture

## Module map

```text
custom_components/smart_heat_controller/
├── __init__.py      setup/unload, services, WebSocket API, frontend registration
├── const.py         domain constants, config keys, defaults
├── controller.py    PURE decision engine (no Home Assistant imports)
├── energy.py        PURE energy accounting (counters, ledger, periods)
├── baseline.py      PURE baseline and before/after comparison
├── price.py         PURE price resolution and cost estimation
├── coordinator.py   Home Assistant glue: listeners, snapshot, apply, persistence
├── config_flow.py   seven-step wizard + menu driven options flow
├── entity.py        shared entity base (device info, unique ids)
├── sensor.py        projections of ZoneData
├── binary_sensor.py presence, faults, connectivity, power anomalies
├── number.py        quick settings
├── select.py        operating mode
├── switch.py        dry run
├── button.py        baseline workflow
├── diagnostics.py   redacted config-entry dump
└── frontend/        Lit + TypeScript dashboard card (Vite build)
```

The split is deliberate: `controller.py`, `energy.py`, `baseline.py` and
`price.py` import **nothing** from Home Assistant, so the difficult logic —
hysteresis, minimum runtimes, presence debouncing, counter resets, daylight
saving boundaries — is unit tested in milliseconds without the HA test harness.

## Control loop

```text
state change / 30 s tick
        │
        ▼
build ZoneSnapshot        temperature, age, presence, availability, real switch state
        │
        ▼
update_presence()         debounce raw → confirmed (absence delay, arrival confirm)
        │
        ▼
expire_timers()           boost / timed override
        │
        ▼
resolve_mode()            Auto → Home/Away from presence, else the selected mode
        │
        ▼
evaluate()                → Decision + new ZoneState
        │
        ▼
apply()                   only calls a service when the state actually differs
        │
        ▼
update_energy()           counter deltas into the daily ledger
        │
        ▼
publish ZoneData          entities + WebSocket payload for the card
```

`evaluate()` is deterministic: same config + snapshot + state always yields the
same decision. That is what makes the controller testable.

## Decision precedence

1. `Disabled` → no action.
2. `Manual` → no action, the user drives the devices.
3. Safety minimum temperature → radiator forced ON, minimum OFF time bypassed.
4. Back-up heating policy (heat pump unavailable and the user opted in).
5. Away → radiator OFF.
6. Hysteresis band → hold the current state.
7. Radiator ON below / OFF above thresholds.
8. Minimum ON/OFF times block any change that is not safety driven.

Presence resolution order: any entity Home → Home; all available entities Away →
Away; otherwise Unknown. Unknown presence never silently becomes Away.

## Fault handling

| Fault | Behaviour |
|---|---|
| `temperature_missing` | No setpoint change, no temperature-driven switching |
| `temperature_stale` | Falls back to the configured radiator policy (`hold`/`on`/`off`) |
| `heat_pump_unavailable` | Setpoint held, optional radiator back-up |
| `radiator_unavailable` | Never commanded, never assumed OFF |
| `presence_unknown` | Mode follows the configured unknown-presence policy |

Service failures are caught and logged; a missing service never aborts the
coordination loop.

## WebSocket contract

`smart_heat_controller/zones` returns, per zone:

```jsonc
{
  "entry_id": "...", "name": "...", "area": 15, "image_url": null,
  "entities": { "mode": "select...", "home_target": "number...", "...": "..." },
  "actuators": { "climate": "climate...", "switches": ["switch..."],
                 "outside_sensor": "sensor...", "presence_entities": ["..."] },
  "mode": "auto", "effective_mode": "home", "reason": "...",
  "presence": "home", "presence_raw": "home",
  "faults": [], "dry_run": false, "room_temperature": 20.0,
  "radiator":  { "power_w": 0,   "kwh_today": 0.8, "quality": "measured", "available": true },
  "heatpump":  { "power_w": 420, "kwh_today": 4.2, "quality": "measured", "available": true },
  "totals": { "today": { "radiator": {...}, "heatpump": {...}, "total": {...} }, ... },
  "costs":  { "today": { "total": 10.0 }, ... },
  "price":  { "sek_per_kwh": 2.0, "quality": "measured", "includes_fees": true },
  "savings": { "baseline_kwh_per_day": 12.1, "delta_kwh_per_day": 3.9, "..." : "..." },
  "baseline": { "start": "...", "end": "...", "active": false, "recorded": true },
  "series": { "radiator": [...], "heatpump": [...] },
  "settings": { "home_target": 21, "...": "..." },
  "last_updated": "2026-11-05T17:20:00+01:00"
}
```

Entity ids are resolved server side through the entity registry, so the card
never has to guess names and never needs hardcoded entity ids.

## Persistence

`Store` (version 1) keeps, per zone:

```jsonc
{
  "zone":       { "selected_mode": "auto", "radiator_on": false, "...": "..." },
  "ledger":     { "radiator": { "2026-11-05": { "kwh": 0.83, "complete": true } } },
  "baseline":   { "start": "2026-10-08", "end": "2026-10-22" },
  "counters":   { "radiator": {...}, "heatpump": {...} },
  "integrators":{ "radiator": {...}, "heatpump": {...} }
}
```

Writes are debounced by 10 s and flushed on unload.

## Frontend

- Lit 3 + TypeScript, bundled by Vite into a single ES module
  (`frontend/dist/smart-heat-controller.js`, committed).
- The integration serves it from `/smart_heat_controller/` and registers it with
  `frontend.add_extra_js_url` — no manual Lovelace resource step.
- Charts are hand-written SVG; there are no runtime dependencies beyond Lit.
- Design tokens read HA theme variables with the approved light values as
  fallbacks, so dark mode follows the active theme.

## Deliberate limitations

- **No sidebar panel.** HA has no supported API for adding sidebar items from a
  custom integration; a dedicated dashboard view is used instead.
- **No `climate` proxy entity.** Creating one would mean two controllers fighting
  over the same heat pump. The integration commands the existing entity.
- **No schedule UI yet.** The state machine exposes `Comfort`/`Eco`/`Boost` and
  timed overrides, but the weekly schedule (Phase 3) is not implemented; the card
  does not pretend otherwise.
- **No weather normalisation.** Outside temperature is context, not a correction
  factor, until a transparent method is implemented.
