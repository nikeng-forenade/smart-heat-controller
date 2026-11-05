/** Minimal Home Assistant frontend typings used by the card. */

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: Record<string, unknown>,
    notification?: unknown,
    returnResponse?: boolean,
  ): Promise<unknown>;
  callWS<T = unknown>(msg: Record<string, unknown>): Promise<T>;
  formatEntityState?(entity: HassEntity): string;
  locale?: { language: string };
  language?: string;
}

export interface DailyPoint {
  date: string;
  kwh: number | null;
  complete: boolean;
}

export interface EnergySeries {
  start: string;
  end: string;
  radiator: DailyPoint[];
  heatpump: DailyPoint[];
}

export interface EnergyTotal {
  kwh: number;
  days_with_data: number;
  days_in_period: number;
  incomplete_days: number;
  coverage: number;
  quality: "measured" | "estimated" | "incomplete" | "missing";
}

export interface SavingsPayload {
  source: string;
  baseline_kwh_per_day: number | null;
  comparison_kwh_per_day: number | null;
  delta_kwh_per_day: number | null;
  percent: number | null;
  baseline_days: number;
  comparison_days: number;
  baseline_quality: string;
  comparison_quality: string;
  baseline_start: string | null;
  baseline_end: string | null;
  comparison_start: string | null;
  comparison_end: string | null;
  limited_to_radiator: boolean;
  has_result: boolean;
  is_increase: boolean;
}

export interface BaselinePayload {
  start: string | null;
  end: string | null;
  active: boolean;
  recorded: boolean;
  length_days: number;
}

export interface ZonePayload {
  entry_id: string;
  name: string;
  area?: number | null;
  image_url?: string | null;
  available: boolean;
  entities: Record<string, string>;
  actuators?: {
    climate?: string | null;
    switches?: string[];
    temperature_sensor?: string | null;
    outside_sensor?: string | null;
    presence_entities?: string[];
  };
  mode?: string;
  effective_mode?: string;
  reason?: string;
  presence?: string;
  presence_raw?: string;
  faults?: string[];
  dry_run?: boolean;
  room_temperature?: number | null;
  radiator?: {
    power_w: number | null;
    kwh_today: number | null;
    quality: string;
    available: boolean;
  };
  heatpump?: {
    power_w: number | null;
    kwh_today: number | null;
    quality: string;
    available: boolean;
  };
  totals?: Record<string, Record<string, EnergyTotal>>;
  costs?: Record<string, Record<string, number | null>>;
  price?: {
    sek_per_kwh: number | null;
    quality: string;
    source: string;
    includes_fees: boolean;
  };
  savings?: SavingsPayload | null;
  savings_warning?: string | null;
  baseline?: BaselinePayload;
  series?: EnergySeries;
  settings?: {
    home_target: number | null;
    away_target: number | null;
    radiator_on_below: number | null;
    radiator_off_above: number | null;
    min_safety_temp: number | null;
    hysteresis: number | null;
    min_on_minutes: number | null;
    min_off_minutes: number | null;
    nominal_power: number | null;
    heatpump_target: number | null;
    radiator_on: boolean | null;
  };
  last_updated?: string | null;
}

export interface ZonesResponse {
  zones: ZonePayload[];
}

export interface CardConfig {
  type: string;
  entry_id?: string;
  title?: string;
  image_url?: string;
}

export interface HistoryPoint {
  t: number;
  y: number;
}

export interface HistoryResponse {
  [entityId: string]: Array<[number, number | string]>;
}
