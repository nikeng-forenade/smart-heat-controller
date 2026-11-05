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
  compared against a matched-duration window. Negative savings are shown as
  increased consumption, never hidden.
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

Registered automatically by the integration (no manual resource needed). Add a
card:

```yaml
type: custom:smart-heat-dashboard
entry_id: <config entry id>   # optional, defaults to the first zone
```

A ready-to-use dashboard is in [`dashboards/smart-heat.yaml`](dashboards/smart-heat.yaml).
Use a **panel mode** view so the card spans the full width.

> Home Assistant does not provide a supported API for injecting items into its
> own sidebar. The dashboard therefore lives in a dedicated view rather than a
> fake sidebar entry; the settings panel inside the card is the integration's own
> drawer.

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
| `select` | `select.sagas_hus_operating_mode` | Operating mode |
| `number` | `number.sagas_hus_home_target` | Home target, away target, radiator band, hysteresis, minimum ON/OFF |
| `sensor` | `sensor.sagas_hus_heating_energy_today` | Energy, cost, savings, coverage, last decision |
| `binary_sensor` | `binary_sensor.sagas_hus_power_anomaly` | Presence, faults, connectivity, power anomalies |
| `button` | `button.sagas_hus_start_baseline` | Baseline workflow |
| `switch` | `switch.sagas_hus_dry_run` | Shadow mode |

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
- the data-quality of both windows,
- how many days each window covers,
- whether the comparison is radiator-only or whole-zone,
- negative results as increased consumption.

Weather normalisation is intentionally **not** claimed as verified. The outside
temperature is plotted for context only.

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

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements_test.txt
.venv/Scripts/python -m pytest
```

Home Assistant's test harness requires Python 3.14 for HA 2026.10+. On Windows,
see [docs/troubleshooting.md](docs/troubleshooting.md#running-the-tests-on-windows).

## License

MIT
