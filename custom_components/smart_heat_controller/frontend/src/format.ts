/** Swedish-first formatting helpers built on Intl. */

import type { HomeAssistant } from "./types";

export type Lang = "sv" | "en";

export function language(hass?: HomeAssistant): Lang {
  const raw = hass?.locale?.language ?? hass?.language ?? "sv";
  return raw.toLowerCase().startsWith("en") ? "en" : "sv";
}

const STRINGS = {
  sv: {
    auto: "Auto",
    home: "Hemma",
    away: "Borta",
    boost: "Boost",
    mode: "Driftläge",
    settings: "Inställningar",
    room: "Rumstemperatur",
    outside: "Utetemperatur",
    outsideMissing:
      "Ingen utetemperatursensor vald – använd pumpens utegivare, en vädersensor eller välj sensor i inställningarna.",
    presence: "Närvaro",
    unknown: "Okänd",
    measured: "Mätt",
    estimated: "Uppskattad",
    incomplete: "Ofullständig",
    missing: "Saknas",
    today: "Idag",
    yesterday: "Igår",
    week: "Denna vecka",
    month: "Denna månad",
    energy: "Energiförbrukning (uppvärmning)",
    cost: "Förbrukning & kostnad",
    savings: "Besparing (automatisering)",
    quick: "Snabbinställningar",
    baseline: "Baslinje & jämförelse",
    target: "Mål",
    powerNow: "Förbrukning just nu",
    todayShort: "Idag",
    systemStatus: "Systemstatus",
    online: "Online",
    offline: "Offline",
    updated: "Senast uppdaterad",
    before: "Före",
    after: "Efter",
    noData: "Ingen data ännu",
    perDay: "kWh/dygn",
    radiator: "Gnosjö element (Shelly)",
    heatpump: "Mitsubishi luft/luft",
    heating: "Värmer",
    idle: "Av",
    startBaseline: "Starta baslinje",
    stopBaseline: "Avsluta baslinje",
    baselineHint:
      "Baslinjen registrerar förbrukning innan automationen aktiveras.",
    noBaseline: "Ingen baslinje registrerad ännu.",
    partialHeatpump: "Värmepumpens el mäts inte – endast elementets besparing visas.",
    options: "Alla inställningar",
    general: "Allmänt",
    temperatures: "Temperaturer",
    schedule: "Schema",
    price: "Elpris-optimering",
    energyMetering: "Energimätning",
    advanced: "Avancerat",
    dryRun: "Torrkörning",
    dryRunOn: "Torrkörning – inga kommandon skickas",
    faults: "Fel",
    noFaults: "Inga fel",
    lastDecision: "Senaste beslut",
    version: "Version",
    close: "Stäng",
    roomTarget: "Mål hemma",
    awayTarget: "Mål borta",
    awayHvac: "Värmepumpen när ingen är hemma",
    awayHvacHint:
      "Bara driftläget ändras – börvärdet styrs som vanligt. Välj Behåll för att lämna pumpen precis som den är.",
    awayHvacKeep: "Behåll som den är",
    awayHvacHeat: "Slå på värme",
    awayHvacFan: "Endast fläkt",
    awayHvacOff: "Stäng av",
    onBelow: "Element PÅ under",
    offAbove: "Element AV över",
    save: "Spara",
    confirm: "Bekräfta",
    cancel: "Avbryt",
    manualOverride: "Manuell överstyrning i 30 minuter",
    noEntities: "Integationen är inte konfigurerad.",
    demo: "Demodata",
    decrease: "Minska",
    increase: "Öka",
    heatpumpSection: "Värmepump",
    fanSpeed: "Fläkthastighet vid start",
    fanSpeedHint:
      "Skickas till pumpen när styrenheten sätter på den. Ändrar du fläkten på fjärrkontrollen rör vi den inte igen.",
    fanKeep: "Behåll som den är",
    fanNone:
      "Pumpen rapporterar inga fläktlägen – styr fläkten på fjärrkontrollen i stället.",
    startTarget: "Starttemperatur",
    startTargetHint:
      "Börvärdet som skickas i samma stund som pumpen startas. Därefter tar rummets mål över.",
    startTargetAuto: "Inte satt – rummets mål används.",
    startTargetCustom: "Egen starttemperatur används.",
    clear: "Nollställ",
    now: "Nu",
    priceSpot: "Spotpris",
    priceSurcharge: "Nätavgift + energiskatt",
    priceTotal: "Totalt pris",
    inclVat: "inkl. moms",
    priceSourceSensor: "Källa: prissensorn (live).",
    priceSourceAllIn: "Källa: fast all-in-pris från inställningarna.",
    priceSourceNone: "Inget elpris valt – koppla en prissensor under Elpris-optimering.",
    priceHintTotal: "Spot + nätavgift och energiskatt, allt inkl. moms.",
    priceHintSpot:
      "Spotpriset inkluderar moms men saknar nätavgift och energiskatt – fyll i dem under Elpris-optimering.",
  },
  en: {
    auto: "Auto",
    home: "Home",
    away: "Away",
    boost: "Boost",
    mode: "Mode",
    settings: "Settings",
    room: "Room temperature",
    outside: "Outside temperature",
    outsideMissing:
      "No outside temperature available – use the unit's own outdoor sensor, a weather entity, or pick a sensor in the settings.",
    presence: "Presence",
    unknown: "Unknown",
    measured: "Measured",
    estimated: "Estimated",
    incomplete: "Incomplete",
    missing: "Missing",
    today: "Today",
    yesterday: "Yesterday",
    week: "This week",
    month: "This month",
    energy: "Heating energy",
    cost: "Consumption & cost",
    savings: "Savings (automation)",
    quick: "Quick settings",
    baseline: "Baseline & comparison",
    target: "target",
    powerNow: "Power now",
    todayShort: "Today",
    systemStatus: "System status",
    online: "Online",
    offline: "Offline",
    updated: "Last updated",
    before: "Before",
    after: "After",
    noData: "No data yet",
    perDay: "kWh/day",
    radiator: "Gnosjö radiator (Shelly)",
    heatpump: "Mitsubishi air/air",
    heating: "Heating",
    idle: "Off",
    startBaseline: "Start baseline",
    stopBaseline: "Stop baseline",
    baselineHint: "The baseline records consumption before automation is enabled.",
    noBaseline: "No baseline recorded yet.",
    partialHeatpump: "Heat pump electricity is not measured – radiator savings only.",
    options: "All settings",
    general: "General",
    temperatures: "Temperatures",
    schedule: "Schedule",
    price: "Price optimisation",
    energyMetering: "Energy metering",
    advanced: "Advanced",
    dryRun: "Dry run",
    dryRunOn: "Dry run – no commands are sent",
    faults: "Faults",
    noFaults: "No faults",
    lastDecision: "Last decision",
    version: "Version",
    close: "Close",
    roomTarget: "Home target",
    awayTarget: "Away target",
    awayHvac: "Heat pump when nobody is home",
    awayHvacHint:
      "Only the HVAC mode changes – the setpoint is still controlled. Pick Leave as it is to keep the unit exactly as it is.",
    awayHvacKeep: "Leave as it is",
    awayHvacHeat: "Switch heating on",
    awayHvacFan: "Fan only",
    awayHvacOff: "Switch off",
    onBelow: "Radiator on below",
    offAbove: "Radiator off above",
    save: "Save",
    confirm: "Confirm",
    cancel: "Cancel",
    manualOverride: "Manual override for 30 minutes",
    noEntities: "The integration is not configured.",
    demo: "Demo data",
    decrease: "Decrease",
    increase: "Increase",
    heatpumpSection: "Heat pump",
    fanSpeed: "Fan speed at start",
    fanSpeedHint:
      "Sent to the unit when the controller switches it on. If you change the fan on the remote we leave it alone.",
    fanKeep: "Leave as it is",
    fanNone: "The unit reports no fan speeds – use the remote to change the fan.",
    startTarget: "Start temperature",
    startTargetHint:
      "The setpoint sent at the moment the unit starts. The room target takes over afterwards.",
    startTargetAuto: "Not set – the room target is used.",
    startTargetCustom: "A custom start temperature is used.",
    clear: "Reset",
    now: "Now",
    priceSpot: "Spot price",
    priceSurcharge: "Grid fee + energy tax",
    priceTotal: "Total price",
    inclVat: "incl. VAT",
    priceSourceSensor: "Source: the price sensor (live).",
    priceSourceAllIn: "Source: fixed all-in price from the settings.",
    priceSourceNone: "No electricity price selected – connect a price sensor under Price optimisation.",
    priceHintTotal: "Spot + grid fee and energy tax, all including VAT.",
    priceHintSpot:
      "The spot price includes VAT but not the grid fee or energy tax – add them under Price optimisation.",
  },
} as const;

export type StringKey = keyof (typeof STRINGS)["sv"];

export function t(hass: HomeAssistant | undefined, key: StringKey): string {
  return STRINGS[language(hass)][key];
}

export function locale(hass?: HomeAssistant): string {
  return language(hass) === "en" ? "en-SE" : "sv-SE";
}

export function formatNumber(
  hass: HomeAssistant | undefined,
  value: number | null | undefined,
  digits = 1,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "–";
  }
  return new Intl.NumberFormat(locale(hass), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCurrency(
  hass: HomeAssistant | undefined,
  value: number | null | undefined,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "–";
  }
  return new Intl.NumberFormat(locale(hass), {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTime(hass: HomeAssistant | undefined, iso?: string | null): string {
  if (!iso) {
    return "–";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "–";
  }
  return new Intl.DateTimeFormat(locale(hass), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDay(hass: HomeAssistant | undefined, iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat(locale(hass), {
    day: "numeric",
    month: "short",
  }).format(date);
}

const MODE_LABELS: Record<string, { sv: string; en: string }> = {
  auto: { sv: "Auto", en: "Auto" },
  home: { sv: "Hemma", en: "Home" },
  away: { sv: "Borta", en: "Away" },
  comfort: { sv: "Komfort", en: "Comfort" },
  eco: { sv: "Eco", en: "Eco" },
  boost: { sv: "Boost", en: "Boost" },
  manual: { sv: "Manuell", en: "Manual" },
  disabled: { sv: "Avstängd", en: "Disabled" },
};

export function modeLabel(hass: HomeAssistant | undefined, mode?: string): string {
  if (!mode) {
    return "–";
  }
  const entry = MODE_LABELS[mode];
  if (!entry) {
    return mode;
  }
  return language(hass) === "en" ? entry.en : entry.sv;
}

const REASON_LABELS: Record<string, { sv: string; en: string }> = {
  automation_disabled: {
    sv: "Automationen är avstängd.",
    en: "Automation is disabled.",
  },
  manual_mode_no_action: {
    sv: "Manuellt läge – styrenheten rör ingenting.",
    en: "Manual mode – the controller does nothing.",
  },
  temperature_below_on_threshold: {
    sv: "Rumstemperaturen ligger under PÅ-tröskeln.",
    en: "Room temperature is below the ON threshold.",
  },
  temperature_above_off_threshold: {
    sv: "Rumstemperaturen har nått AV-tröskeln.",
    en: "Room temperature reached the OFF threshold.",
  },
  within_hysteresis_band: {
    sv: "Inom hysteresbandet – inget byte behövs.",
    en: "Inside the hysteresis band – no change needed.",
  },
  minimum_safety_temperature: {
    sv: "Under lägsta säkerhetstemperatur – elementet tvingas PÅ.",
    en: "Below the minimum safety temperature – radiator forced ON.",
  },
  away: {
    sv: "Borta-läge – elementet hålls avstängt.",
    en: "Away mode – radiator kept off.",
  },
  backup_heating_for_missing_heatpump: {
    sv: "Värmepumpen är otillgänglig – elementet används som reservvärme.",
    en: "Heat pump unavailable – radiator used as backup heating.",
  },
  radiator_unavailable: {
    sv: "Elementet svarar inte – inga kommandon skickas.",
    en: "Radiator is unavailable – no commands sent.",
  },
  fallback_temperature_hold: {
    sv: "Ingen giltig temperatur – elementet lämnas oförändrat.",
    en: "No valid temperature – radiator left unchanged.",
  },
  fallback_temperature_on: {
    sv: "Ingen giltig temperatur – felläge håller elementet PÅ.",
    en: "No valid temperature – fallback keeps the radiator ON.",
  },
  fallback_temperature_off: {
    sv: "Ingen giltig temperatur – felläge håller elementet AV.",
    en: "No valid temperature – fallback keeps the radiator OFF.",
  },
  price_optimisation_off: {
    sv: "Prisoptimering är avstängd.",
    en: "Price optimisation is off.",
  },
  no_price_available: {
    sv: "Inget elpris tillgängligt.",
    en: "No electricity price available.",
  },
  cheap_price_but_nobody_home: {
    sv: "Billigt pris, men ingen är hemma – ingen förvärmning.",
    en: "Cheap price, but nobody is home – no preheating.",
  },
  preheat_cheap_price: {
    sv: "Billigt pris – börvärdet höjs försiktigt.",
    en: "Cheap price – setpoint raised slightly.",
  },
  setback_blocked_by_comfort_floor: {
    sv: "Dyrt pris, men komfortgolvet stoppar sänkningen.",
    en: "Expensive price, but the comfort floor blocks the setback.",
  },
  setback_expensive_price: {
    sv: "Dyrt pris – börvärdet sänks inom komfortgränsen.",
    en: "Expensive price – setpoint lowered within the comfort limit.",
  },
  price_within_normal_range: {
    sv: "Priset ligger inom normalt intervall.",
    en: "Price is within the normal range.",
  },
};

export function reasonLabel(
  hass: HomeAssistant | undefined,
  reason?: string,
): string {
  if (!reason) {
    return "–";
  }
  const base = reason.replace(/_(already_in_state|blocked_by_min_runtime)$/, "");
  const entry = REASON_LABELS[reason] ?? REASON_LABELS[base];
  if (!entry) {
    return reason.replaceAll("_", " ");
  }
  return language(hass) === "en" ? entry.en : entry.sv;
}

export function presenceLabel(
  hass: HomeAssistant | undefined,
  presence?: string,
): string {
  switch (presence) {
    case "home":
      return t(hass, "home");
    case "away":
      return t(hass, "away");
    default:
      return t(hass, "unknown");
  }
}
