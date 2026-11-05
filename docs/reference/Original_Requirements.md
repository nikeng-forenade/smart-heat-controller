# AI Development Prompt — Smart Heat Controller for Home Assistant

## Role
You are a senior Home Assistant integration developer with expertise in Python, Home Assistant Core, Config Flows, Options Flows, climate entities, HACS, and frontend development.

Build a production-quality Home Assistant custom integration named **Smart Heat Controller**, installable through HACS and configurable through a graphical interface without YAML.

## 1. Project background
Initial installation: a detached residential building of approximately 15 m².

Existing equipment:
- Mitsubishi air-to-air heat pump already integrated with Home Assistant, providing current room temperature and climate temperature control.
- Gnosjö R 6508 BL oil-filled electric radiator, 800 W, with mechanical thermostat.
- Radiator connected through a Shelly smart plug with power monitoring.
- UniFi integration available to detect occupant Saga's smartphone WiFi presence.

Goal: minimize electricity consumption while maintaining comfort. Mitsubishi provides primary heat; radiator supplements only when necessary. Control logic must run within Home Assistant, without an external custom server or subscription. Existing device integrations may have their own cloud dependencies; detect and document these rather than claiming fully local operation automatically.

## 2. Architecture
Create a proper Home Assistant custom integration using current supported APIs. Verify against official Home Assistant developer documentation before coding.

Suggested repository structure:

```text
custom_components/
  smart_heat_controller/
    __init__.py
    manifest.json
    config_flow.py
    climate.py
    sensor.py
    binary_sensor.py
    switch.py
    number.py
    select.py
    button.py
    coordinator.py
    controller.py
    const.py
    translations/
      en.json
      sv.json
hacs.json
README.md
tests/
```

Requirements:
- HACS-compatible GitHub repository and installation instructions
- UI Config Flow and Options Flow
- Multiple independent heating zones
- Entity selectors, validation, and capability detection
- Restore/reconcile states after restart
- Async event-driven operation; no blocking event-loop calls
- No hardcoded entity IDs or manufacturer dependencies
- Diagnostic logging and Swedish/English translations
- Unit tests

## 3. GUI setup wizard
The integration must be added through **Settings → Devices & Services → Add Integration → Smart Heat Controller**.

### Step 1 — Heating zone
- Name, description, room/building, optional area in m²
- Example: Saga's House, 15 m²

### Step 2 — Primary heater
- Select an existing `climate` entity (Mitsubishi)
- Detect current temperature, target temperature, HVAC mode, availability, and supported features
- Do not assume every climate entity supports the same capabilities

### Step 3 — Supplementary heater
- Select one or more existing `switch` entities (Shelly Plug)
- Optional power sensor (W) and cumulative energy sensor (kWh)
- Optional nominal power (800 W) for clearly labeled estimates
- Validate entity availability and configured power rating

### Step 4 — Temperature source
- Select a temperature sensor OR the primary climate entity's `current_temperature`
- Optional sensor offset and stale-data timeout
- Never treat the climate target temperature as measured room temperature

### Step 5 — Presence
- Select person, device_tracker, binary_sensor, or multiple entities
- Support WiFi presence via UniFi
- Configurable absence delay (default 30 min), arrival confirmation, manual override, and unknown/unavailable behavior
- Brief WiFi drops must not cause immediate Away transitions

### Step 6 — Temperatures and safeguards
Defaults (all user-editable):

| Setting | Home | Away |
|---|---:|---:|
| Heat pump target | 21 °C | 18 °C |
| Radiator ON below | 19 °C | Normally off |
| Radiator OFF above | 20 °C | Normally off |
| Minimum safety temperature | 16 °C | 16 °C |

- Adjustable hysteresis and minimum ON/OFF times
- Validate sensible thresholds and temperature ranges
- Configurable fail-safe behavior

### Step 7 — Review
- Display selected entities, thresholds, safety settings
- Offer dry-run simulation before enabling automatic control

## 4. Heating control engine
Use an explicit state machine. Modes:
- Automatic, Home, Away, Comfort, Eco, Boost, Manual, Disabled

### Home
- Set Mitsubishi to 21 °C (if supported)
- When room temperature is below 19 °C, allow Shelly-controlled radiator ON
- When room temperature reaches 20 °C, turn radiator OFF
- Enforce minimum ON/OFF periods to avoid short cycling

### Away
- After confirmed absence for 30 minutes, set Mitsubishi to 18 °C
- Turn radiator OFF under normal conditions
- Maintain minimum safe temperature and monitor device health

### Faults and fallback
- Missing/stale temperature: stop normal temperature-dependent switching; report fault and apply a documented conservative fallback
- Unavailable Shelly: report error, do not assume it is off or repeatedly command it
- Unavailable heat pump: notify and apply user-configured backup heating policy when safe
- Home Assistant restart: restore mode and reconcile actual states before making changes
- Presence unknown: preserve a safe, documented mode rather than automatically assuming Away

**Electrical safety:** This software is not a safety thermostat. Preserve the radiator's built-in thermostat and overtemperature protection. Verify Shelly plug's suitability for continuous resistive 800 W heating load and connection directly to a suitable wall outlet. Never bypass safety devices. Do not assume remotely switching a heater is safe in every installation.

## 5. Scheduling
GUI weekly schedule supporting:
- Home/Away temperatures
- Night setback and weekday/weekend profiles
- Vacation and timed Boost modes
- Temporary manual overrides with clear expiration
- Schedule conflict handling

## 6. Energy and cost monitoring
Show:
- Instant radiator power (W)
- Daily, weekly, monthly energy (kWh)
- Runtime and duty cycle
- Current mode and last control action
- Optional electricity price and cost estimates

Use measured energy when available. Clearly distinguish measured data from nominal-power estimates. Support optional Nord Pool SE4 price entities without assuming a specific entity name. Use Home Assistant-supported statistics and recorder patterns; avoid excessive writes.

## 7. Optional electricity price optimization
GUI settings for price sensor, cheap/expensive thresholds, max target adjustment, minimum comfort temperature, and enable/disable. Allow modest preheating when cheap and setbacks when expensive, within comfort/safety limits. Avoid preheating that increases total heat loss unnecessarily. This must be optional and must not undermine safety.

## 8. Dashboard and UI
Provide a polished dashboard with:
- Current and target temperature
- Presence Home/Away
- Mitsubishi state and radiator state
- Radiator W, daily kWh, estimated cost
- Active mode, next scheduled change, alerts
- Controls for Home/Away targets, radiator thresholds, modes, Boost, and price optimization

Prefer standard Home Assistant entities and native dashboard cards. If a custom Lovelace card is needed, package it as a separate HACS-compatible frontend resource. The backend must function without any dashboard open.

## 9. Advanced GUI
Options Flow should allow changing zone settings, sensors, offsets, presence delays, hysteresis, minimum runtimes, fallback rules, notifications, energy sensors, and scheduling. Use supported HA UI patterns; do not invent unsupported custom configuration pages.

## 10. Diagnostics
Expose useful entities or attributes for:
- Controller mode and health
- Presence and heating demand
- Supplementary heating demand
- Last decision and reason
- Last valid temperature reading
- Fault state

Support optional debug logging and downloadable diagnostics with secrets redacted.

## 11. Automated testing
Use pytest and Home Assistant-supported test fixtures. Cover:
1. Arrival and departure
2. Temporary WiFi disconnection
3. Threshold crossing and hysteresis
4. Minimum ON/OFF durations
5. Heat pump unavailable
6. Shelly unavailable
7. Temperature stale/unavailable
8. Home Assistant restart and state reconciliation
9. Manual override and expiry
10. Multiple independent zones
11. Electricity price changes
12. Missing optional energy sensor

## 12. Deliverables
Produce a complete working GitHub repository:
- All integration source files and HACS metadata
- Swedish/English translations
- GUI setup and Options Flows
- Controller and diagnostic entities
- Dashboard examples
- Automated tests
- README.md and installation/configuration guides
- Architecture and troubleshooting documentation
- Example setup for Saga's house

Do not provide pseudocode or placeholder implementations. Verify APIs and implement working files with tests.

## 13. Development phases
**Phase 1 — MVP:** HACS install, one zone, entity selection, Mitsubishi + Shelly control, UniFi presence, Home/Away, fault fallback, restart recovery, tests.

**Phase 2 — GUI and dashboards:** Advanced Options Flow, multiple zones, dashboard, energy monitoring, overrides, notifications.

**Phase 3 — Optimization:** Electricity price control, schedules, historical cost analysis, advanced diagnostics.

Start with architecture and Phase 1. Explain any Home Assistant API limitations before implementation. Generate actual repository files and runnable tests.

## 14. REQUIRED: Verified power consumption and savings dashboard (W, kWh, SEK)

The purpose of this integration is to **prove whether the automation saves electricity and money**, not merely to show radiator ON/OFF status. Implement this as a first-class feature in the GUI and tests.

### Source entities and measurement quality
- Let the user select Shelly's instantaneous power sensor (W) and cumulative energy sensor (kWh or Wh) for the oil-filled radiator. Prefer measured cumulative energy over numerical integration of power; if only W exists, integrate carefully with correct units and handling of gaps, and label derived data.
- Optionally select a **separate** Mitsubishi heat pump power (W) and energy (kWh) sensor. A climate entity's operating state or temperature does **not** provide actual electrical consumption. Do not claim total heating savings unless heat pump energy is measured or a clearly labeled estimate is used.
- Allow additional heater/zone energy entities. Never double-count an energy sensor and its derived integral, or UPS/circuit sensors that include the same load.
- Validate unit_of_measurement, device_class, state_class, availability, reset behavior, and monotonic energy readings. Handle `unknown`, `unavailable`, counter resets, stale readings, sensor replacement, daylight-saving time and recorder gaps.
- Use Home Assistant Recorder/statistics APIs appropriately for historical aggregation; do not store unbounded raw samples in integration state.

### Dashboard: real-time and history
Display for each heating zone:
- **Radiator now: W** (e.g. 0 W or ~800 W)
- **Heat pump now: W**, if a real sensor is configured
- **Combined heating now: W** only if all relevant loads are measured; otherwise show "partial measurement"
- Radiator and heat pump kWh **today, yesterday, 7 days, 30 days and this calendar month**
- Total measured heating kWh for the same periods, when complete
- Radiator runtime in hours and percentage of time
- Room temperature, heating setpoint, Saga Home/Away, current control mode
- Price per kWh (user-entered or existing price sensor), estimated/measured cost in SEK for each period
- Line chart for W over time; bar chart for daily kWh; optional temperature overlay
- Sensor health and data coverage percentage; clear badges for **Measured**, **Estimated**, or **Incomplete**

### Baseline and before/after savings
- Add a **Baseline / Measurement mode** that records normal consumption **before automation** for a configurable 7-14 days, while allowing the user to keep existing safe heating control. Clearly show the baseline's start/end dates and completeness.
- After activation, compare daily average kWh and SEK against the baseline, with matching date windows where possible.
- Show **radiator-only reduction** separately from **whole-zone measured heating reduction** (radiator + Mitsubishi).
- Provide absolute and percentage changes: `baseline_kWh - current_kWh`, and `100 * change / baseline_kWh` when baseline > 0. Negative savings must be shown as increased consumption, never hidden.
- Do not present simple before/after differences as proven causal savings: outside temperature, occupancy, setpoints and weather vary. Optionally support outdoor temperature and heating-degree-day normalization, with a transparent method and confidence/limitations.
- If Mitsubishi consumption is unavailable, label results **"Radiator savings only — heat pump electricity not included"**. Do not label these as net household savings.
- If the electricity price is missing, show kWh savings without inventing a monetary amount. Distinguish spot price from full tariff including taxes, network fees and VAT; allow an all-in price input.
- Provide optional comparison with a user-configured previous period, including graph, percentage, SEK and an explanation of data coverage.
- Offer CSV export of daily aggregated data and a compact weekly/monthly savings report.

### Savings dashboard example (illustrative, not real readings)
- Radiator now: **0 W**
- Radiator today: **2.4 kWh**
- Radiator baseline average: **6.0 kWh/day**
- Radiator reduction: **3.6 kWh/day (60%)**
- At **2.00 SEK/kWh**: **7.20 SEK/day radiator-only reduction**
- Heat pump: **Not measured**
- Net heating savings: **Unknown until Mitsubishi electricity is measured**

### Alerts and validation
- Alert when radiator draws power unexpectedly while automation requests OFF, or when the smart plug reports ON but power remains zero for an unusual period; allow tolerance and startup delay.
- Alert when radiator power is persistently much higher than configured nominal 800 W, subject to measurement tolerance.
- Report missing measurements and avoid fabricated zeroes.
- Validate that Shelly Plug is rated for continuous 800 W resistive heating load and that radiator/manufacturer instructions permit plug-based switching; the built-in thermostat and thermal safety must remain intact.

### Tests required for this feature
Add unit/integration tests for W-to-kWh conversion, counter resets, missing sensors, partial data, price changes, baseline comparisons, negative savings, incomplete heat pump measurement, midnight/daylight-saving boundaries, and no double-counting.

### Priority change
Implement **Shelly live W + daily kWh + measurement completeness in Phase 1**. Implement baseline collection and radiator-only before/after comparison in Phase 2. Implement measured whole-zone savings, weather normalization, price analysis, CSV export and advanced reports in Phase 3.

## 15. Confirmed Mitsubishi energy entities in Saga's house (implementation update)

The user's existing Home Assistant Mitsubishi device is named **Sagahus**. The device currently exposes:

- A `climate` control in Heat mode, with target and measured room temperature (screenshot: both 20 C).
- `Room temperature` (20 C in screenshot).
- `Outside temperature` (5 C in screenshot).
- `Energy consumed` (480.30 kWh in screenshot): historical graph rises from approximately 477.2 to 480.3 kWh over the visible days, consistent with a cumulative energy counter. Confirm the entity's metadata and reset behavior in HA; do not infer an exact entity_id from its display name.
- `Daily energy consumed`: `unavailable` in screenshot. This must NOT block energy reporting.

### Mandatory setup and calculations

1. In the GUI, let the user select **Mitsubishi cumulative energy consumed** independently from the unavailable daily sensor. Offer compatible energy entities discovered on the same device, but do not hardcode entity IDs.
2. Derive daily, weekly and monthly Mitsubishi kWh from the cumulative meter using Home Assistant-supported statistics or `utility_meter`-equivalent logic. Handle unknown/unavailable, data gaps, resets and restarts without reporting false negative consumption. Respect local midnight and daylight saving time.
3. Select Shelly radiator instantaneous power (W) and cumulative energy (kWh) separately. Show radiator live W and kWh for day/week/month.
4. Show combined measured heating energy: **Mitsubishi kWh + Shelly radiator kWh**, without double counting. If either source is missing, label the combined result incomplete; never invent the missing portion.
5. Offer daily/weekly/monthly history charts for Mitsubishi, radiator and total. Provide baseline versus optimized mode comparisons with measured kWh, SEK and percent, where valid.
6. Use Mitsubishi's outside temperature as an optional context input for weather-normalized comparisons, but explain that it is a heat-pump sensor reading, not necessarily a representative outdoor weather station.
7. Show the source and freshness of each measurement, and clearly distinguish cumulative meter totals (such as 480.30 kWh) from energy used during the currently selected period.
8. Include tests demonstrating that a cumulative counter increasing from 477.2 to 480.3 kWh corresponds to approximately 3.1 kWh **over that observed interval**, not over the whole month selected in the history UI.

This functionality is required in **Phase 1** for Mitsubishi cumulative-to-daily energy and Shelly power monitoring; extend to full before/after savings in subsequent phases. The first baseline must be collected before claiming any verified saving.

---

# 16. REQUIRED UI IMPLEMENTATION — EXACT LIGHT DASHBOARD MOCKUP

**This section is mandatory and takes precedence over generic dashboard suggestions.** The user approved a specific light-theme dashboard mockup. Implement the user interface to closely match the supplied image `Smart_Heat_Controller_Light_Mockup.png`. The image is a visual reference, not a screenshot of working software. Its sample values must never be treated as real data.

## 16.1 Design reference and layout

- Primary target: Home Assistant desktop dashboard, approximately 1536 x 1024 reference composition, responsive down to mobile widths.
- Light theme by default: off-white app background (#F5F8FC approx.), white cards, subtle gray borders and shadows, blue primary accents, green for healthy/active states, orange for electric radiator chart series, violet for outdoor-temperature line.
- Follow the active Home Assistant theme when possible, including dark mode, while retaining the exact information architecture.
- Rounded cards (roughly 12–18 px), consistent padding, modern typography, iconography and aligned baselines. Avoid excessive saturated panels.
- The left navigation in the mockup is Home Assistant's own sidebar; DO NOT recreate or override HA's global sidebar. Instead provide a dedicated dashboard view labeled **Smart Heat**. The right settings panel belongs to this integration's UI and may be a responsive drawer.
- Header: flame icon; `Smart Heat Controller – Sagas hus`; automatic-mode status pill; settings action.
- Top row: a user-configurable image/zone identity card (`Sagas hus`, `15 m²`), current room temperature card (20.0 °C example; home target 21.0 °C), outside temperature card (5.0 °C example), and presence card (Saga: Hemma/Borta/Okänd).
- Second row: Mitsubishi air/air climate card (HVAC mode, actual state, target, measured power W *only if a genuine power sensor exists*), Gnosjö oil-filled radiator through Shelly (ON/OFF switch, current W, today's kWh), and four-mode selector `Auto | Hemma | Borta | Boost` with active-mode description.
- Middle row left: **Energiförbrukning (uppvärmning)**, 7-day stacked columns (Mitsubishi kWh in blue, Gnosjö/Shelly kWh in orange), overlaid outside temperature °C line in violet on a separate labeled axis. Real historical data, meaningful gaps when unavailable, accessible chart tooltips and legend.
- Middle row right upper: **Förbrukning & kostnad**, Today / This week / This month with kWh and SEK, clearly mark estimated cost when the price source is estimated or incomplete.
- Middle row right lower: **Besparing (automatisering)**, baseline average kWh/day, comparison average kWh/day, delta kWh/day, percentage, cost difference, sample counts and confidence/quality notice. Never label weather-normalized estimates as verified measured savings.
- Bottom row left: **Snabbinställningar**, live-adjustable Home target, Away target, radiator ON below and radiator OFF above; enforce sensible min/max and hysteresis; show save/pending state and provide explicit confirmation for impactful changes.
- Bottom row right: **Baslinje & jämförelse**, paired before/after bars, measurement-period labels, outdoor-temperature context, data completeness, source names, and the date automation started.
- Right-side settings drawer: `Allmänt`, `Temperaturer`, `Schema`, `Elpris-optimering`, `Närvaro (UniFi)`, `Energimätning`, `Notiser`, `Avancerat`; lower **Systemstatus** with separate health for Mitsubishi, Shelly, temperature source and presence, plus last update time.
- Support Swedish labels by default and English translations. Keep labels spelled correctly; the mockup is conceptual and may contain minor rendering artifacts.

## 16.2 Interaction requirements — NOT a static mockup

Every visible control must work. A mock UI with dummy values, inert buttons, screenshots embedded as a card, or only a YAML dashboard is NOT acceptable.

- Auto/Home/Away/Boost changes control mode and updates backend state.
- Radiator switch reflects actual Shelly switch state and offers an explicitly time-limited manual override; do not silently fight the controller.
- Sliders modify persistent configuration with validation and feedback.
- Cards open more detailed device/energy information as appropriate.
- Date selection on charts supports day/week/month views; energy chart and savings comparison use real HA history/statistics where available.
- Right drawer opens on desktop and as a full-height modal/sheet on mobile.
- Loading, offline, stale data, unavailable entities, permission errors and empty history have clear visual states.
- Use `Intl`-appropriate Swedish number and currency formatting, units, contrast and keyboard accessibility.
- Never display fake power readings or fake savings in production; for demos, mark all sample data clearly as `Demodata`.

## 16.3 Frontend architecture

A normal HA custom integration alone cannot automatically reproduce a bespoke dashboard. Build **two deliverables in the same GitHub project**:

1. HA backend custom integration (`custom_components/smart_heat_controller`) installed via HACS, with config/options flows, entities, state machine, energy statistics and safety behavior.
2. A real frontend UI, preferably a HACS-compatible custom Lovelace card/dashboard component written in TypeScript (Lit or current HA frontend conventions), using HA's supported frontend APIs. Package compiled JS as a resource and document automatic or manual resource registration depending on supported HA/HACS mechanisms. Do not rely on undocumented HA internals.

The frontend must read live HA states, call authorized HA services for commands, and persist settings through supported integration options/services. The backend must operate without an open browser or frontend card. The UI must be usable from HA mobile app, tablet and desktop. Include a ready-to-use dashboard example and installation instructions.

If a custom sidebar item/panel cannot be installed reliably via supported APIs, document the limitation and use a dedicated HA dashboard view rather than hacking the sidebar.

## 16.4 Exact device mappings for initial zone

- Zone: `Sagas hus`, area <=15 m².
- Mitsubishi climate entity is already in HA and exposes room temperature, setpoint and operating mode.
- Mitsubishi `Energy consumed` is a cumulative energy counter, observed at 480.30 kWh; its history rises from roughly 477.2 kWh to 480.3 kWh in the displayed interval. **480.30 is historical observed context, not a permanent value.**
- Mitsubishi `Daily energy consumed` currently displays `Unavailable`; derive daily/weekly/monthly deltas from cumulative readings using HA statistics/utility-meter-like logic with reset detection. Do not assume an unavailable daily entity is required.
- Mitsubishi outside temperature is available (observed 5.0 °C); validate it is a suitable outdoor reference.
- A cumulative energy counter does **not** provide instantaneous watts. Only show Mitsubishi W if a separate real power entity is selected; otherwise display `Ej tillgängligt` and omit W from instantaneous total.
- Shelly smart plug for existing Gnosjö R 6508 BL, 800 W; choose actual switch, power W and cumulative kWh sensors in GUI. Validate plug continuous resistive-load rating and installation.
- Presence via Saga's UniFi device tracker; optional HA person/mobile-app sensor as corroboration. Avoid immediate away transitions due to brief WiFi disconnects.
- Suggested defaults: Home Mitsubishi 21 °C, Away 18 °C, supplemental radiator ON below 19 °C, OFF at 20 °C; adjust for sensor placement and comfort. A minimum safe temperature and fail-safe behavior must be configurable.
- Local control is preferred, but verify the installed Mitsubishi integration's actual connectivity; never claim local-only Mitsubishi operation if it depends on a cloud API.

## 16.5 Savings science and measurement integrity

- Total heating energy = Mitsubishi measured kWh + Shelly measured kWh, only when both cover the same time interval. Show source coverage and partial-data warnings.
- Calculate daily, weekly, monthly totals and cost. Distinguish measured energy from nominal-power estimates.
- A before/after reduction does not automatically prove automation savings: weather, occupancy, target temperature and measurement coverage may differ. Display both raw comparison and optional weather-adjusted estimate with transparent methodology and limitations.
- The baseline must capture 7–14 days of real data where possible; compare equivalent-duration periods and show baseline/comparison date ranges and outside-temperature averages.
- Never show `32% besparing` unless calculated from actual measurements; the mockup's 12.1 versus 8.2 kWh/day is illustrative only.
- Optional price integration uses actual configured electricity price sensor with correct SEK/kWh and tax/fees labeling; never claim a full retail price from spot price alone.
- Include test cases for counter reset, unavailable daily energy sensor, missing power sensor, missing baseline, gaps in history, daylight-saving time, HA restart, Shelly offline, UniFi presence flapping and safe heating fallback.

## 16.6 Required delivery and acceptance criteria

Deliver a complete repo including Python backend, TypeScript frontend source, compiled distributable JS, HACS metadata, UI translations, README, setup instructions, screenshot(s), and tests. Include instructions to add the approved image to the AI's working folder. Verify compatibility with current Home Assistant and HACS docs before using APIs.

Acceptance test: install on a clean HA test instance, add the integration via UI, select the existing Mitsubishi, Shelly and UniFi entities, add the dashboard, see the approved light design with live state, switch between Auto/Home/Away/Boost, edit settings, see energy charts and truthful before/after comparison, and verify controller continues working with the browser closed. Explicitly document what cannot be implemented with supported HA APIs; do not replace requested functionality with nonfunctional visual placeholders.

**Start by inspecting the reference image, proposing the backend/frontend file tree and UI component hierarchy, and then implement the working MVP end-to-end before polishing.**
