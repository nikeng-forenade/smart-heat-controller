# Smart Heat Controller

A Home Assistant custom integration (HACS) plus a Lovelace dashboard card that
controls a heat pump together with a supplementary electric radiator, and —
most importantly — **measures whether the automation actually saves energy and
money**.

Built for a 15 m² outbuilding ("Sagas hus") with:

| Role | Hardware |
|---|---|
| Primary heat | Mitsubishi air-to-air heat pump (`climate.*`) |
| Supplementary heat | Gnosjö R 6508 BL oil-filled radiator, 800 W, via Shelly Plug |
| Presence | UniFi device tracker (Saga's phone) |
| Energy | Shelly power/energy sensor + Mitsubishi cumulative energy meter |

Everything runs inside Home Assistant. No external server, no subscription.

---

## What it does

- **Explicit state machine** — `Auto`, `Home`, `Away`, `Comfort`, `Eco`, `Boost`,
  `Manual`, `Disabled`.
- **Native thermostat** — a `climate` entity per zone with current temperature,
  target, HVAC mode and preset modes, so the standard HA thermostat card works.
  It writes zone settings; it never competes with the state machine.
- **Sidebar panel** — `Smart Heat` is added to the Home Assistant sidebar (and
  removed again when the last zone is deleted) alongside the optional Lovelace
  card.
- **Weekly schedule** — weekday/weekend profiles with night setback, plus
  vacation ranges. The radiator thresholds follow the scheduled setpoint.
- **Price optimisation** — optional, modest preheating when electricity is cheap
  and a setback when it is expensive, never below the comfort floor.
- **Radiator hysteresis** with configurable ON/OFF thresholds, minimum ON/OFF
  times and a hard minimum safety temperature that always wins.
- **Presence debouncing** — a brief WiFi dropout never flips the zone to Away.
- **Fault handling** — stale or missing temperature, offline Shelly, offline heat
  pump and unknown presence all have documented, conservative behaviour.
- **Restart reconciliation** — reads the real switch state before acting, so it
  never assumes a state it did not observe.
- **Measured energy** — cumulative meters are converted to daily deltas with
  reset, gap and unit handling. Every number carries a quality label
  (`measured`, `estimated`, `incomplete`, `missing`).
- **Baseline & savings** — a 7–14 day baseline recorded *before* automation, then
  compared against a matched-duration window, both raw and weather-normalised
  (kWh per heating degree day). Negative savings are shown as increased
  consumption, never hidden.
- **Dashboard card** — matches the approved light mockup, follows the active HA
  theme, works on desktop, tablet and mobile.

---

## Installation

### 1. Via HACS (recommended)

1. HACS → Integrations → ⋮ → *Custom repositories*.
2. Add this repository URL, category **Integration**.
3. Install **Smart Heat Controller**, then restart Home Assistant.

### 2. Manually

Copy `custom_components/smart_heat_controller/` into your Home Assistant
`config/custom_components/` folder and restart.

### 3. Add the integration

**Settings → Devices & Services → Add Integration → Smart Heat Controller**

The wizard walks through seven steps:

1. **Heating zone** — name, optional area, optional photo URL.
2. **Primary heater** — the Mitsubishi `climate` entity.
3. **Supplementary heater** — Shelly switch, optional power (W) and energy (kWh)
   sensors, nominal power.
4. **Temperature source** — a room sensor *or* the heat pump's own reading, an
   offset and a stale-data timeout.
5. **Presence** — person / device_tracker / binary_sensor, absence delay,
   arrival confirmation, unknown-presence behaviour.
6. **Temperatures and safeguards** — home/away targets, radiator band, safety
   temperature, hysteresis, minimum ON/OFF times.
7. **Review** — summary and a **dry run** toggle. Start in dry run: the
   controller computes and logs decisions without calling any service.

---

## Dashboard

Two ways in, both registered automatically:

1. **Sidebar panel** — `Smart Heat` next to Overview/Energy. Added with
   `frontend.async_register_built_in_panel` and removed when the last zone is
   deleted. Disable it with the `panel_enabled` option if you only want the card.
2. **Lovelace card** — `custom:smart-heat-dashboard` for embedding in your own
   dashboard.

```yaml
type: custom:smart-heat-dashboard
entry_id: <config entry id>   # optional, defaults to the first zone
```

A ready-to-use dashboard is in [`dashboards/smart-heat.yaml`](dashboards/smart-heat.yaml).
Use a **panel mode** view so the card spans the full width.

The settings drawer (gear icon) contains **Allmänt**, **Temperaturer**,
**Värmepump**, **Schema**, **Elpris-optimering**, **Energimätning**, **Närvaro**
and **Avancerat**. Schedule and price edits are written straight to the
integration through the WebSocket API; nothing is a placeholder.

Every temperature and number is changed with a **− / +** stepper instead of a
range slider, because drag gestures are unreliable in the Home Assistant mobile
apps.

**Värmepump** holds the start-up profile: the fan speed and the setpoint sent to
the air/air unit at the moment the controller switches it into heating (for
example when everybody comes home again). The normal control loop takes over on
the following cycle, and a fan speed the unit does not advertise is never sent.

### Building the card after changing the frontend

```bash
cd custom_components/smart_heat_controller/frontend
npm install
npm run build          # writes dist/smart-heat-controller.js (committed)
```

---

## Entities

| Domain | Example | Purpose |
|---|---|---|
| `climate` | `climate.sagas_hus_thermostat` | Zone thermostat: current temp, target, HVAC mode, presets |
| `select` | `select.sagas_hus_operating_mode` | Operating mode |
| `number` | `number.sagas_hus_home_target` | Home target, away target, radiator band, hysteresis, minimum ON/OFF |
| `sensor` | `sensor.sagas_hus_heating_energy_today` | Energy, cost, savings, coverage, last decision |
| `binary_sensor` | `binary_sensor.sagas_hus_power_anomaly` | Presence, faults, connectivity, power anomalies |
| `button` | `button.sagas_hus_start_baseline` | Baseline workflow |
| `switch` | `switch.sagas_hus_dry_run` | Shadow mode |

The thermostat's presets map onto the controller modes, so
`preset_mode: away` is the same thing as `select: away`. Setting a temperature on
the thermostat writes the home target (or the away target when the zone is in
Away), which keeps the automation and the manual controls consistent.

### WebSocket API (used by the card)

| Command | Purpose |
|---|---|
| `smart_heat_controller/zones` | Full zone payload for the dashboard |
| `smart_heat_controller/set_schedule` | Replace the weekly schedule |
| `smart_heat_controller/set_vacation` | Set the vacation date range |
| `smart_heat_controller/set_price` | Update price optimisation settings |
| `smart_heat_controller/set_away_hvac_mode` | Choose what the heat pump does while the zone is away |
| `smart_heat_controller/set_heatpump_profile` | Fan speed and start temperature used when the pump is started |

### Services

| Service | Description |
|---|---|
| `smart_heat_controller.set_mode` | Change mode, optionally for a limited number of minutes |
| `smart_heat_controller.clear_override` | Return to Auto |
| `smart_heat_controller.start_baseline` | Begin recording a baseline |
| `smart_heat_controller.stop_baseline` | Close the baseline period |
| `smart_heat_controller.export_csv` | Write daily aggregates to CSV |

All services accept an optional `entry_id` when more than one zone exists.

---

## Energy accounting

Rules the implementation follows:

- **Prefer a cumulative meter.** Shelly `kWh` and Mitsubishi `Energy consumed`
  are read as monotonically increasing counters; the daily value is the delta
  between two observations, so a meter reading of 480.30 kWh never appears as
  "today's consumption".
- **Counter resets** are detected (`new < old`) and counted from zero instead of
  producing a large negative delta.
- **Gaps** (recorder restarts, device offline) mark the day as incomplete rather
  than silently under-reporting.
- **Units** (`Wh`, `kWh`, `MWh`) are converted to kWh.
- **Fallback integration** — if only a power sensor exists, W is integrated with
  the trapezoidal rule and every value is labelled *estimated*.
- **No double counting** — one energy entity per load; a derived integral is
  never added on top of a meter.
- **Combined totals** are only marked measured when *both* loads are measured.
  Otherwise the UI shows "Radiator savings only — heat pump electricity not
  included".

Daily aggregates are stored as bounded per-day buckets (400 days) in
`.storage/smart_heat_controller.state.<entry_id>`, never as raw samples. Exposed
energy sensors use `state_class: total` with a midnight `last_reset`, so the
Recorder builds long-term statistics from them as well.

---

## Savings methodology

A before/after difference is **not** proof of causal savings — outdoor
temperature, occupancy and setpoints all vary. The card therefore shows:

- the raw kWh/day comparison,
- a weather-normalised view in kWh per heating degree day (base 17 °C), with the
  degree days of both windows shown,
- the data-quality of both windows,
- how many days each window covers,
- whether the comparison is radiator-only or whole-zone,
- negative results as increased consumption.

The normalised figure is explicitly labelled an estimate. It cannot correct for
solar gain, wind, internal gains or changed occupancy.

## Schedule, vacation and price

- **Schedule** — weekday (Mon–Fri) and weekend (Sat–Sun) profiles. Each profile
  is a list of `start → target` segments. Before a day's first segment the
  previous day's last segment carries over, so a 22:00 setback keeps applying
  after midnight. Duplicate start times resolve to the later entry.
- **Vacation** — a date range that makes the zone behave as away, but only while
  the mode is `Auto`, so a deliberate manual mode is never silently undone.
- **Price optimisation** — off by default. When enabled, a price at or below the
  cheap threshold raises the setpoint by at most `max_adjust` degrees *and only
  while somebody is home*; a price at or above the expensive threshold lowers it,
  never below `min_comfort`. The offset is capped at two degrees of stored heat
  because a lightweight building mostly loses extra preheating.

---

## Safety

This software is **not** a safety thermostat.

- The radiator's built-in thermostat and overtemperature protection must remain
  intact and must never be bypassed.
- Verify that the Shelly plug model is rated for a **continuous resistive 800 W**
  load and that the radiator manufacturer permits plug-based switching.
- Connect the plug directly to a suitable wall outlet — no extension leads.
- Remotely switching a heater is not safe in every installation.

---

## Documentation

- [Architecture](docs/architecture.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Example setup for Sagas hus](docs/saga-example.md)
- [Approved UI mockup](docs/reference/Smart_Heat_Controller_Light_Mockup.png)

---

## Development

Home Assistant 2026.10 requires **Python 3.14**.

```powershell
# Windows: creates/reuses .venv, installs deps and the POSIX shims, runs pytest
./scripts/setup_test_env.ps1
./scripts/setup_test_env.ps1 -TestArgs tests/test_energy.py -v
```

```bash
# Linux / macOS
python3.14 -m venv .venv
.venv/bin/pip install -r requirements_test.txt
.venv/bin/python -m pytest
```

Why the Windows script installs extra shims: HA's test harness imports the
POSIX-only modules `fcntl` and `resource`, so the harness cannot even be
imported on Windows. `tests/win_shims` provides minimal stand-ins and is
installed as a normal package — nothing is copied into `site-packages` by hand.
See [docs/troubleshooting.md](docs/troubleshooting.md#running-the-tests-on-windows).

## License

MIT
