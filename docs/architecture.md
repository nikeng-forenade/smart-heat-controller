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

`away_hvac_mode` decides what happens to the heat pump's HVAC mode when the zone
is away. The setpoint is still controlled in every case; only the mode differs.

| Value | Behaviour |
|---|---|
| `keep` (default) | Leave the unit's HVAC mode alone, whatever it is right now |
| `heat` | Switch the unit back to `heat` so it takes the load from the radiator |
| `fan_only` | Switch the unit to fan, so an empty house is aired but not heated |
| `off` | Switch the unit off |

The applied mode is remembered, so coming home restores heating. If the unit was
changed by hand while away, the controller leaves it alone instead of forcing
`heat` back on. With `keep` the controller never sends an HVAC mode command, so
the pump stays exactly as it was left in Home Assistant.

The setting is editable in three places: the options flow (Settings → Devices &
services → Smart Heat Controller → Configure → Safety), the panel's settings
drawer under **Temperaturer**, and the
`smart_heat_controller/set_away_hvac_mode` WebSocket command.

## Away boost

`away_boost` (off by default) lets the heat pump, not the 800 W radiator, warm
a cold empty house. It only applies while the zone is away, and while it is
enabled it replaces the `away_hvac_mode` handling.

| Phase | When | Pump |
|---|---|---|
| Boost | room < `away_boost_start_below` (17 °C) | switched to `heat` if needed, fan `away_boost_fan_mode` (`auto`), setpoint `away_boost_stop_at` + 1 °C |
| Idle | room ≥ `away_boost_stop_at` (18 °C), until it drops below start again | stays in `heat`, fan `away_idle_fan_mode` (`1`), setpoint the away target |

The setpoint is one degree above the stop temperature because the unit's own
sensor sits high on the wall and reads warmer than the room sensor. An idle pump
that is off or on fan is not switched on until the room is actually cold, and
the start-up profile is not applied when the boost starts the pump. The
radiator stays off throughout; only the minimum safety temperature can still
switch it on, so keep the start temperature above it.

The fan speed the boost replaced is remembered and given back when somebody
comes home (or the boost is switched off), unless the start-up profile names a
fan speed, which then wins. Fan speeds the unit does not list are never sent.

Settings: options flow (**Configure → Safety**), the panel's **Värmepump**
section, and `smart_heat_controller/set_away_boost`. The zone payload carries
`away_boost`: `null` (not in play), `true` (boosting) or `false` (low fan).

## Dashboard power

The cards show `power_w` from the zone payload with a `power_source`:

| Source | Meaning |
|---|---|
| `sensor` | the configured W sensor |
| `energy_average` | no W sensor: the kWh meter's average over the last 30 minutes (MELCloud has no W sensor) |
| `nominal` | no usable reading: plug state × rated power |

Approximations are shown with `≈`. They are for display only — the power
sensor entities and the power anomaly check still use measured values only.

## Heat pump start-up profile

When the controller itself switches the pump into heating — coming home after
`away_hvac_mode` put it on `fan_only`/`off`, or `away_hvac_mode: heat` switching
it back on — it applies the configured start-up profile in the same breath:

| Option | Effect |
|---|---|
| `heatpump_fan_mode` | Sent with `climate.set_fan_mode`. Values the unit does not list in its `fan_modes` attribute are skipped, never guessed |
| `heatpump_start_target` | Sent with `climate.set_temperature` so the unit starts at a known setpoint. Cleared from the controller's remembered command, so the normal loop sends the zone target on the next cycle |

The profile is applied only at that transition; if the fan is changed on the
remote afterwards the controller does not fight it. Changing the fan speed in
the panel applies it immediately to a pump that is already heating. Both options
are stored as config entry options and are editable in the panel's settings
drawer under **Värmepump** (`smart_heat_controller/set_heatpump_profile`).

Presence resolution order: any entity Home → Home; all available entities Away →
Away; otherwise Unknown. Unknown presence never silently becomes Away.

## Electricity price

The `price_sensor` is read as SEK/kWh and normalised from the sensor's own unit
first: `öre/kWh` and `cents/kWh` are divided by 100 and `SEK/MWh` by 1000, so a
Nordpool sensor configured in öre cannot inflate every cost figure by 100.

The sensor value is treated as **including VAT**, which is what Nordpool
produces when its VAT setting is on — `sensor.nordpool_kwh_se4_sek_3_10_025`
ends in `025` precisely because VAT is 25 %. The `price_surcharge` option adds
the grid transfer fee and energy tax in öre/kWh, quoted including VAT the way
the invoice shows them.

A live sensor wins over a typed-in `all_in_price`: the sensor follows the spot
market while a fixed number silently goes stale. `all_in_price` is only used
when no sensor is configured.

The resolved price carries `spot_sek_per_kwh`, `surcharge` and `vat_percent`
next to the total, in both the WebSocket payload and the cost sensors'
attributes, and the panel's **Energimätning** section shows the breakdown so the
number can be checked against the invoice.

## Outdoor temperature

The card, the chart and the degree-day ledger all use one resolver,
`_read_outside_temperature()`:

1. the configured `outside_temperature_sensor`,
2. otherwise the heat pump's own outdoor sensor — MELCloud exposes
   `outside_temperature` / `outside_temp` on the climate entity,
3. otherwise the `temperature` attribute of a weather entity (`weather.home`
   first).

That way an unconfigured option never hides a reading the devices already
provide. When nothing is available the card says so instead of showing a bare
dash, and both temperature sensors can be re-pointed later in the options flow
(**Configure → Temperaturer**).

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
  "price":  { "sek_per_kwh": 2.0, "spot_sek_per_kwh": 1.06, "surcharge": 0.94,
              "vat_percent": 25.0, "source": "price_sensor",
              "quality": "estimated", "includes_fees": true },
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
