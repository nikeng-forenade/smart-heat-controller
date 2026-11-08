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
        ├─ vacation active (Auto only) ─────────────► force Away
        ▼
resolve_schedule()        weekly segments → scheduled_target (or None)
        │
        ▼
optimise_for_price()      cheap/expensive → small offset within comfort limits
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
update_energy()           counter deltas into the daily ledger + outdoor temperature
        │
        ▼
publish ZoneData          entities, thermostat and WebSocket payload for the card
```

`evaluate()` is deterministic: same config + snapshot + state always yields the
same decision. That is what makes the controller testable.

## Setpoint composition

The heat pump target is built in three clearly separated steps:

```text
base      = schedule segment target (if enabled)  else  home/away/comfort/eco/boost
+ offset  = price optimisation (±max_adjust, bounded by min_comfort)
= target  = clamp(base + offset, minimum_safety_temperature, 30 °C)
```

The radiator band moves with the base target:

```text
on_below = radiator_on_below + (base - home_target)
off_above = radiator_off_above + (base - home_target)
```

That is why a 22:00 night setback to 18 °C also lowers the radiator thresholds by
three degrees instead of letting the two heat sources fight each other.

## Decision precedence

1. `Disabled` → no action.
2. `Manual` → no action, the user drives the devices.
3. Safety minimum temperature → radiator forced ON, minimum OFF time bypassed.
4. Back-up heating policy: when the heat pump is unavailable *or* set to a
   non-heating HVAC mode (`off`, `fan_only`, `dry`, `cool`), no setpoint is sent
   to it. With `backup_heating: radiator` the radiator then runs on its own
   configured band (`radiator_on_below` / `radiator_off_above`, shifted by the
   schedule and price offsets). `none` keeps the radiator off.
5. Away → radiator OFF.
6. Hysteresis band → hold the current state.
7. Radiator ON below / OFF above thresholds.
8. Minimum ON/OFF times block any change that is not safety driven.

A radiator switch changed outside the controller is adopted on the next refresh
(its runtime clock restarts from that moment), so the guards always act on the
real device state rather than a stale belief about it. A plug switched on by
hand is treated as a deliberate request and left alone until it is switched off
again or the zone goes away.

When the heat pump is not heating, `backup_heating: radiator` lets the radiator
run on exactly the same configured band as it does alongside the pump, so what
the settings page shows is what happens. `none` keeps the radiator off while the
pump is idle.

## Away and the heat pump

`away_hvac_mode` decides what happens to the heat pump when the zone is away:

| Value | Behaviour |
|---|---|
| `keep` (default) | Heat towards `away_target`, as before |
| `fan_only` | Switch the unit to fan, so an empty house is aired but not heated |
| `off` | Switch the unit off |

The applied mode is remembered, so coming home restores heating. If the unit was
changed by hand while away, the controller leaves it alone instead of forcing
`heat` back on.

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

- **The sidebar item is added, never overridden.** Home Assistant's global
  sidebar layout is untouched; the integration adds one entry (`Smart Heat`)
  through `frontend.async_register_built_in_panel`, and removes it again when the
  last zone is deleted. Registration is skipped entirely when the frontend
  component is not available, so a headless backend still works.
- **The `climate` entity is a zone thermostat, not a heat pump proxy.** It reads
  the zone temperature and the effective target, and writing to it updates the
  zone's own settings. It never commands the Mitsubishi directly, so there is no
  second controller fighting over the pump. Control still flows through the
  state machine.
- **Weather normalisation is an estimate.** kWh per heating degree day (base
  17 °C), computed from the configured outside sensor. It cannot correct for
  solar gain, wind, internal gains or changed occupancy, and the UI says so.
- **Price optimisation is deliberately timid.** At most `max_adjust` degrees of
  preheating, only while somebody is home, never below the comfort floor. It is
  off by default.
- **The schedule has no calendar or holiday awareness.** Weekday/weekend
  profiles plus vacation dates only. A public-holiday calendar is not modelled.
- **No `climate` proxy around the pump** means integrations that write directly
  to the Mitsubishi (e.g. its own scheduler) can still conflict with this
  controller. Disable competing automations for the same device.
