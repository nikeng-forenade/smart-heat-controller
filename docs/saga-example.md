# Example setup — Sagas hus

A detached 15 m² outbuilding. The example shows *roles*, not hardcoded entity
ids — select your own entities in the wizard.

## Devices

| Role | Entity (example) | Notes |
|---|---|---|
| Heat pump | `climate.sagahus` | Mitsubishi air/air, Heat mode, exposes current and target temperature |
| Heat pump room temperature | attribute `current_temperature` | Optional: use instead of a separate sensor |
| Heat pump outside temperature | `sensor.sagahus_outside_temperature` | Context only, not a weather station |
| Heat pump cumulative energy | `sensor.sagahus_energy_consumed` | `state_class: total_increasing`, kWh |
| Heat pump daily energy | `sensor.sagahus_daily_energy_consumed` | **Currently `unavailable` — do not select it** |
| Radiator switch | `switch.shelly_gnosjo` | Shelly plug |
| Radiator power | `sensor.shelly_gnosjo_power` | W |
| Radiator energy | `sensor.shelly_gnosjo_energy` | kWh |
| Presence | `device_tracker.saga_phone` | UniFi |

## Wizard answers

| Step | Value |
|---|---|
| Zone name | Sagas hus |
| Area | 15 m² |
| Primary heater | `climate.sagahus` |
| Supplementary heater | `switch.shelly_gnosjo`, power + energy sensors, nominal 800 W |
| Temperature source | `climate.sagahus` `current_temperature` (or a dedicated room sensor) |
| Outside temperature | `sensor.sagahus_outside_temperature` |
| Presence | `device_tracker.saga_phone` |
| Absence delay | 30 min |
| Arrival confirmation | 0 min |
| Unknown presence | Keep the last known mode |
| Home target | 21 °C |
| Away target | 18 °C |
| Radiator ON below | 19 °C |
| Radiator OFF above | 20 °C |
| Minimum safety temperature | 16 °C |
| Hysteresis | 0.5 °C |
| Minimum ON / OFF | 10 min / 10 min |
| Dry run | **on** for the first days |

## Recommended roll-out

1. **Days 1–2 — dry run.** Watch `sensor.*_last_decision` and confirm the
   controller would make the changes you expect. Nothing is commanded.
2. **Days 3–16 — baseline.** Turn dry run off but keep the manual heating you
   already trust, then press **Starta baslinje**. 14 days of real consumption is
   recorded.
3. **Day 17 — activate.** Press **Avsluta baslinje**, switch the mode to Auto.
   The card now compares the running window against the baseline.
4. **Week 3+** — review `sensor.*_savings` and the *Baslinje & jämförelse* card.
   If the heat pump energy meter is not selected, the result is explicitly
   labelled radiator-only.

## Expected consumption pattern

- Heat pump: the dominant load, several kWh per day in winter.
- Radiator: 0 W most of the day, ~800 W in short bursts when the room drops
  below 19 °C and the heat pump alone cannot keep up.

If the radiator runs for hours while `sensor.*_last_decision` says
`within_hysteresis_band`, the thresholds are too tight for the room — widen the
band rather than shortening the minimum runtimes.

## Safety checklist for this installation

- [ ] Shelly plug rated for continuous 800 W resistive load.
- [ ] Radiator's own thermostat and thermal cut-out untouched.
- [ ] Plug connected directly to a wall outlet.
- [ ] Radiator not covered, nothing flammable nearby.
- [ ] `minimum_safety_temperature` verified against the building's frost risk.
