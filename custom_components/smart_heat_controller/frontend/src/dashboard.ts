/** Smart Heat Controller dashboard card — matches the approved light mockup. */

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./energy-chart";
import "./settings-drawer";
import {
  formatCurrency,
  formatNumber,
  formatTime,
  modeLabel,
  presenceLabel,
  reasonLabel,
  t,
} from "./format";
import { sharedStyles } from "./styles";
import type {
  CardConfig,
  EnergySeries,
  HomeAssistant,
  HistoryPoint,
  ZonePayload,
  ZonesResponse,
} from "./types";

const REFRESH_MS = 30_000;
const HISTORY_MS = 5 * 60_000;

const MODES: Array<{ id: string; key: "auto" | "home" | "away" | "boost"; icon: string }> = [
  { id: "auto", key: "auto", icon: "M12 3v2m0 14v2M5.6 5.6 7 7m10 10 1.4 1.4M3 12h2m14 0h2M5.6 18.4 7 17m10-10 1.4-1.4" },
  { id: "home", key: "home", icon: "M4 11 12 4l8 7v9H4z" },
  { id: "away", key: "away", icon: "M3 16h18l-2-5H5zM6 16v4m12-4v4" },
  { id: "boost", key: "boost", icon: "M5 15c4 0 4-9 9-9 3 0 5 2 5 5s-2 5-5 5H5z" },
];

@customElement("smart-heat-dashboard")
export class SmartHeatDashboard extends LitElement {
  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        background: var(--shc-bg);
        padding: 16px;
        box-sizing: border-box;
      }

      .shell {
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-width: 1536px;
        margin: 0 auto;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 4px 4px 0;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .span2 {
        grid-column: span 2;
      }

      .zone {
        position: relative;
        padding: 0;
        overflow: hidden;
        min-height: 132px;
        background: linear-gradient(135deg, #1e3a5f, #0f172a);
        color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .zone img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.85;
      }

      .zone .caption {
        position: relative;
        padding: 16px 18px;
        background: linear-gradient(to top, rgb(15 23 42 / 78%), transparent);
      }

      .zone .caption strong {
        display: block;
        font-size: 22px;
        font-weight: 700;
      }

      .temp-card .value {
        margin-top: 6px;
      }

      .presence-card .big {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 22px;
        font-weight: 650;
        color: var(--shc-green);
        margin-top: 6px;
      }

      .presence-card.away .big {
        color: var(--shc-orange);
      }

      .presence-card.unknown .big {
        color: var(--shc-muted);
      }

      .device-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;
      }

      .device-head strong {
        font-size: 15px;
        font-weight: 650;
        display: block;
      }

      .device-head .sub {
        font-size: 13px;
        font-weight: 600;
        color: var(--shc-green);
      }

      .device-head .sub.off {
        color: var(--shc-muted);
      }

      .mode-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
        margin-top: 10px;
      }

      .mode-grid button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 6px;
        font-size: 12.5px;
        font-weight: 600;
      }

      .mode-grid svg {
        width: 22px;
        height: 22px;
        stroke: currentColor;
        fill: none;
        stroke-width: 1.7;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .status-note {
        margin-top: 12px;
        display: flex;
        gap: 10px;
        align-items: flex-start;
        font-size: 13px;
        color: var(--shc-muted);
      }

      .status-note strong {
        color: var(--shc-text);
        font-size: 14px;
        display: block;
      }

      .cost-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin-top: 12px;
      }

      .cost-cell {
        border: 1px solid var(--shc-border);
        border-radius: 12px;
        padding: 10px 12px;
      }

      .cost-cell .kwh {
        font-size: 20px;
        font-weight: 680;
        font-variant-numeric: tabular-nums;
      }

      .cost-cell .sek {
        font-size: 13px;
        color: var(--shc-muted);
      }

      .savings-box {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 12px;
        align-items: center;
        margin-top: 10px;
      }

      .savings-box .cell {
        text-align: left;
      }

      .savings-box .cell small {
        display: block;
        color: var(--shc-muted);
        font-size: 12px;
        margin-bottom: 2px;
      }

      .savings-box .cell b {
        font-size: 20px;
        font-variant-numeric: tabular-nums;
      }

      .delta {
        background: var(--shc-green-soft);
        border-radius: 12px;
        padding: 8px 14px;
        text-align: center;
        color: var(--shc-green);
        font-weight: 700;
      }

      .delta.increase {
        background: color-mix(in srgb, var(--shc-red) 10%, transparent);
        color: var(--shc-red);
      }

      .quick-row {
        display: grid;
        grid-template-columns: minmax(120px, 200px) 1fr 62px;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
      }

      .quick-row input[type="range"] {
        width: 100%;
        accent-color: var(--shc-blue);
      }

      .quick-row output {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
        min-width: 58px;
        text-align: right;
      }

      .quick-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }

      .bars {
        display: flex;
        align-items: flex-end;
        gap: 26px;
        height: 132px;
        margin: 14px 0 8px;
      }

      .bar {
        flex: 1;
        border-radius: 8px 8px 4px 4px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        color: #fff;
        font-weight: 700;
        font-size: 15px;
        padding-bottom: 8px;
        position: relative;
      }

      .bar.before {
        background: #cbd5e1;
        color: var(--shc-text);
      }

      .bar.after {
        background: var(--shc-green);
      }

      .bar-caption {
        display: flex;
        gap: 26px;
        font-size: 12.5px;
        color: var(--shc-muted);
      }

      .bar-caption div {
        flex: 1;
        text-align: center;
      }

      .checklist {
        list-style: none;
        margin: 14px 0 0;
        padding: 0;
        display: grid;
        gap: 8px;
      }

      .checklist li {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        font-size: 13px;
        color: var(--shc-muted);
      }

      .checklist li::before {
        content: "✓";
        color: var(--shc-green);
        font-weight: 700;
      }

      .checklist li.warn::before {
        content: "!";
        color: var(--shc-orange);
      }

      .status-list {
        display: grid;
        gap: 8px;
        margin-top: 10px;
      }

      .status-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
      }

      .status-row .ok {
        color: var(--shc-green);
        font-weight: 600;
      }

      .status-row .bad {
        color: var(--shc-red);
        font-weight: 600;
      }

      .banner {
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 13px;
        background: color-mix(in srgb, var(--shc-orange) 14%, transparent);
        color: #92400e;
      }

      @media (max-width: 1100px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .span2 {
          grid-column: span 2;
        }
      }

      @media (max-width: 720px) {
        :host {
          padding: 10px;
        }
        .grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .span2 {
          grid-column: span 1;
        }
        .mode-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .cost-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .savings-box {
          grid-template-columns: 1fr;
        }
        .brand {
          font-size: 18px;
        }
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;

  @state() private config?: CardConfig;

  @state() private zone?: ZonePayload;

  @state() private zones: ZonePayload[] = [];

  @state() private outside: HistoryPoint[] = [];

  @state() private drawerOpen = false;

  @state() private chartDays = 7;

  @state() private error?: string;

  @state() private pending = new Set<string>();

  private lastFetch = 0;

  private lastHistory = 0;

  setConfig(config: CardConfig): void {
    this.config = config;
  }

  getCardSize(): number {
    return 14;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void this.refresh(true);
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has("hass") && this.hass) {
      const now = Date.now();
      if (now - this.lastFetch > REFRESH_MS) {
        void this.refresh();
      }
      if (now - this.lastHistory > HISTORY_MS) {
        void this.loadOutsideHistory();
      }
    }
  }

  private async refresh(force = false): Promise<void> {
    if (!this.hass || (!force && Date.now() - this.lastFetch < 5_000)) {
      return;
    }
    this.lastFetch = Date.now();
    try {
      const response = await this.hass.callWS<ZonesResponse>({
        type: "smart_heat_controller/zones",
      });
      this.zones = response.zones ?? [];
      const wanted = this.config?.entry_id;
      this.zone = wanted
        ? this.zones.find((zone) => zone.entry_id === wanted) ?? this.zones[0]
        : this.zones[0];
      this.error = undefined;
      void this.loadOutsideHistory();
    } catch (err) {
      this.error = err instanceof Error ? err.message : String(err);
    }
  }

  private async loadOutsideHistory(): Promise<void> {
    const sensor = this.zone?.actuators?.outside_sensor;
    if (!this.hass || !sensor) {
      return;
    }
    this.lastHistory = Date.now();
    try {
      const end = new Date();
      const start = new Date(end.getTime() - 14 * 24 * 3600 * 1000);
      const result = await this.hass.callWS<Record<string, Array<[number, number | string]>>>({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        minimal_response: false,
        no_attributes: true,
        entity_ids: [sensor],
      });
      const rows = result?.[sensor] ?? [];
      this.outside = rows
        .map((row) => ({ t: Number(row[0]), y: Number(row[1]) }))
        .filter((point) => Number.isFinite(point.y));
    } catch {
      this.outside = [];
    }
  }

  private entity(key: string): string | undefined {
    return this.zone?.entities?.[key];
  }

  private stateValue(key: string): string | undefined {
    const entityId = this.entity(key);
    return entityId ? this.hass?.states[entityId]?.state : undefined;
  }

  private async setNumber(key: string, value: number): Promise<void> {
    const entityId = this.entity(key);
    if (!entityId || !this.hass) {
      return;
    }
    this.pending = new Set(this.pending).add(key);
    this.requestUpdate();
    try {
      await this.hass.callService("number", "set_value", {
        entity_id: entityId,
        value,
      });
      await this.refresh(true);
    } finally {
      const next = new Set(this.pending);
      next.delete(key);
      this.pending = next;
    }
  }

  private async selectMode(mode: string): Promise<void> {
    const entityId = this.entity("mode");
    if (!entityId || !this.hass) {
      return;
    }
    if (mode === "boost") {
      await this.hass.callService(
        "smart_heat_controller",
        "set_mode",
        {
          entry_id: this.zone?.entry_id,
          mode: "boost",
          duration: 60,
        },
        undefined,
        undefined,
        false,
      );
    } else {
      await this.hass.callService("select", "select_option", {
        entity_id: entityId,
        option: mode,
      });
    }
    await this.refresh(true);
  }

  private async toggleRadiator(): Promise<void> {
    const switches = this.zone?.actuators?.switches ?? [];
    if (!switches.length || !this.hass) {
      return;
    }
    const isOn = switches.some(
      (entityId) => this.hass?.states[entityId]?.state === "on",
    );
    // Explicitly time-boxed manual override so the controller is never
    // silently fought.
    await this.hass.callService("smart_heat_controller", "set_mode", {
      entry_id: this.zone?.entry_id,
      mode: "manual",
      duration: 30,
    });
    await this.hass.callService("switch", isOn ? "turn_off" : "turn_on", {
      entity_id: switches,
    });
    this.drawerOpen = true;
  }

  private async pressButton(key: string): Promise<void> {
    const entityId = this.entity(key);
    if (!entityId || !this.hass) {
      return;
    }
    await this.hass.callService("button", "press", { entity_id: entityId });
    await this.refresh(true);
  }

  private openOptions(): void {
    const entryId = this.zone?.entry_id;
    const url = entryId
      ? `/config/integrations/integration/smart_heat_controller#config_entry=${entryId}`
      : "/config/integrations";
    history.pushState(null, "", url);
    window.dispatchEvent(new Event("location-changed"));
  }

  override render() {
    if (this.error) {
      return html`<div class="card">
        <h3>Smart Heat Controller</h3>
        <p class="empty">${this.error}</p>
      </div>`;
    }

    if (!this.zone) {
      return html`<div class="card"><p class="empty">…</p></div>`;
    }

    const zone = this.zone;
    const settings = zone.settings;
    const roomTemp = this.currentRoomTemperature();
    const heatpumpOn = this.heatpumpHeating();
    const radiatorOn = this.radiatorOn();
    const mode = (zone.mode ?? "auto") as string;
    const presence = zone.presence ?? "unknown";
    const today = zone.totals?.today ?? {};
    const week = zone.totals?.week ?? {};
    const month = zone.totals?.month ?? {};
    const costToday = zone.costs?.today?.total ?? null;
    const costWeek = zone.costs?.week?.total ?? null;
    const costMonth = zone.costs?.month?.total ?? null;
    const savings = zone.savings;
    const series: EnergySeries | undefined = zone.series;
    const dryRun = zone.dry_run === true;

    return html`
      <div class="shell">
        ${dryRun
          ? html`<div class="banner">${t(this.hass, "dryRunOn")}</div>`
          : nothing}
        ${(zone.faults ?? []).length
          ? html`<div class="banner">
              ${t(this.hass, "faults")}: ${(zone.faults ?? []).join(", ")}
            </div>`
          : nothing}

        <div class="topbar">
          <div class="brand">
            <span aria-hidden="true">🔥</span>
            <span>Smart Heat Controller – ${zone.name}</span>
          </div>
          <div class="row">
            <span class="pill ${mode === "auto" ? "ok" : ""}">
              ${mode === "auto"
                ? (this.hass?.locale?.language ?? "").startsWith("en")
                  ? "Automatic"
                  : "Automatisk drift"
                : mode.toUpperCase()}
            </span>
            <button
              aria-label=${t(this.hass, "settings")}
              @click=${() => {
                this.drawerOpen = true;
              }}
            >
              ⚙
            </button>
          </div>
        </div>

        <div class="grid">
          <!-- Row 1 -->
          <div class="card zone">
            ${zone.image_url
              ? html`<img src=${zone.image_url} alt="" />`
              : nothing}
            <div class="caption">
              <strong>${zone.name}</strong>
              ${zone.area ? html`<span class="muted">${zone.area} m²</span>` : nothing}
            </div>
          </div>

          <div class="card temp-card">
            <div class="row">
              <span aria-hidden="true">🌡</span>
              <span class="label">${t(this.hass, "room")}</span>
            </div>
            <div class="value">${formatNumber(this.hass, roomTemp, 1)} °C</div>
            <div class="muted">
              ${t(this.hass, "target")} (${t(this.hass, "home")}):
              ${formatNumber(this.hass, settings?.home_target, 1)} °C
            </div>          </div>

          <div class="card temp-card">
            <div class="row">
              <span aria-hidden="true">☁️</span>
              <span class="label">${t(this.hass, "outside")}</span>
            </div>
            <div class="value">
              ${formatNumber(this.hass, this.outsideTemperature(), 1)} °C
            </div>
          </div>

          <div
            class="card presence-card ${presence === "home"
              ? ""
              : presence === "away"
                ? "away"
                : "unknown"}"
          >
            <div class="row">
              <span aria-hidden="true">👤</span>
              <span class="label">${t(this.hass, "presence")}</span>
            </div>
            <div class="big">
              ${presenceLabel(this.hass, presence)}
            </div>
          </div>

          <!-- Row 2 -->
          <div class="card">
            <div class="device-head">
              <span aria-hidden="true">❄️</span>
              <div>
                <strong>${t(this.hass, "heatpump")}</strong>
                <span class="sub ${heatpumpOn ? "" : "off"}">
                  ${heatpumpOn ? t(this.hass, "heating") : t(this.hass, "idle")}
                </span>
              </div>
            </div>
            <div class="value small">
              ${formatNumber(this.hass, settings?.heatpump_target, 1)} °C
              <span class="muted">(${t(this.hass, "target")})</span>
            </div>
            <div class="spread" style="margin-top:8px">
              <span class="muted">${t(this.hass, "powerNow")}</span>
              <strong
                >${zone.heatpump?.power_w != null
                  ? `${formatNumber(this.hass, zone.heatpump.power_w, 0)} W`
                  : "–"}</strong
              >
            </div>
          </div>

          <div class="card">
            <div class="device-head">
              <span aria-hidden="true">♨️</span>
              <div>
                <strong>${t(this.hass, "radiator")}</strong>
                <span class="sub ${radiatorOn ? "" : "off"}">
                  ${radiatorOn ? t(this.hass, "heating") : t(this.hass, "idle")}
                </span>
              </div>
            </div>
            <div class="spread" style="margin-top:10px">
              <span class="muted">${t(this.hass, "powerNow")}</span>
              <strong
                >${zone.radiator?.power_w != null
                  ? `${formatNumber(this.hass, zone.radiator.power_w, 0)} W`
                  : "–"}</strong
              >
            </div>
            <div class="spread" style="margin-top:6px">
              <span class="muted">${t(this.hass, "todayShort")}</span>
              <strong>${formatNumber(this.hass, zone.radiator?.kwh_today, 2)} kWh</strong>
            </div>
            <button style="margin-top:12px;width:100%" @click=${this.toggleRadiator}>
              ${radiatorOn ? "Slå AV" : "Slå PÅ"} (30 min)
            </button>
          </div>

          <div class="card span2">
            <h3>${t(this.hass, "mode")}</h3>
            <div class="mode-grid">
              ${MODES.map(
                (item) => html`
                  <button
                    class=${mode === item.id ? "active" : ""}
                    @click=${() => this.selectMode(item.id)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${item.icon} /></svg>
                    ${t(this.hass, item.key)}
                  </button>
                `,
              )}
            </div>
            <div class="status-note">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>${modeLabel(this.hass, zone.effective_mode)}</strong>
                ${reasonLabel(this.hass, zone.reason)}
              </div>
            </div>
          </div>

          <!-- Row 3 -->
          <div class="card span2">
            <div class="spread">
              <h3>${t(this.hass, "energy")}</h3>
              <div class="row">
                ${[7, 30].map(
                  (days) => html`
                    <button
                      class=${this.chartDays === days ? "active" : ""}
                      @click=${() => {
                        this.chartDays = days;
                      }}
                    >
                      ${days} ${days === 7 ? "dgr" : "dgr"}
                    </button>
                  `,
                )}
              </div>
            </div>
            <shc-energy-chart
              .hass=${this.hass}
              .heatpump=${series?.heatpump ?? []}
              .radiator=${series?.radiator ?? []}
              .outside=${this.outside}
              .days=${this.chartDays}
            ></shc-energy-chart>
          </div>

          <div class="card span2">
            <h3>${t(this.hass, "cost")}</h3>
            <div class="cost-grid">
              ${[
                { label: t(this.hass, "today"), total: today.total, cost: costToday },
                { label: t(this.hass, "week"), total: week.total, cost: costWeek },
                { label: t(this.hass, "month"), total: month.total, cost: costMonth },
              ].map(
                (cell) => html`
                  <div class="cost-cell">
                    <small class="label">${cell.label}</small>
                    <div class="kwh">
                      ${cell.total ? formatNumber(this.hass, cell.total.kwh, 2) : "–"} kWh
                    </div>
                    <div class="sek">
                      ≈ ${formatCurrency(this.hass, cell.cost)}
                      ${
                        !zone.price?.includes_fees
                          ? html`<span class="quality estimated"
                              >${t(this.hass, "estimated")}</span
                            >`
                          : nothing
                      }
                    </div>
                  </div>
                `,
              )}
            </div>

            <div class="card" style="margin-top:12px;padding:12px 14px;border-radius:12px">
              <div class="spread">
                <h3>🌿 ${t(this.hass, "savings")}</h3>
              </div>
              ${savings?.has_result
                ? html`
                    <div class="savings-box">
                      <div class="cell">
                        <small>${t(this.hass, "before")}</small>
                        <b>${formatNumber(this.hass, savings.baseline_kwh_per_day, 1)}</b>
                        <span class="muted">${t(this.hass, "perDay")}</span>
                      </div>
                      <div class="cell">
                        <small>${t(this.hass, "after")}</small>
                        <b>${formatNumber(this.hass, savings.comparison_kwh_per_day, 1)}</b>
                        <span class="muted">${t(this.hass, "perDay")}</span>
                      </div>
                      <div class="delta ${savings.is_increase ? "increase" : ""}">
                        ${savings.delta_kwh_per_day != null
                          ? `${savings.delta_kwh_per_day < 0 ? "+" : "−"}${formatNumber(
                              this.hass,
                              Math.abs(savings.delta_kwh_per_day),
                              1,
                            )}`
                          : "–"}
                        <div class="muted" style="color:inherit">
                          ${savings.percent != null
                            ? `${formatNumber(this.hass, Math.abs(savings.percent), 0)} %`
                            : ""}
                        </div>
                      </div>
                    </div>
                  `
                : html`<p class="empty">${t(this.hass, "noBaseline")}</p>`}
              ${zone.savings_warning
                ? html`<p class="muted" style="margin:8px 0 0">
                    ${zone.savings_warning}
                  </p>`
                : nothing}
              ${savings && savings.baseline_quality !== "measured"
                ? html`<p class="muted" style="margin:8px 0 0">
                    Datatäckning: ${savings.baseline_quality} / ${savings.comparison_quality}
                  </p>`
                : nothing}
            </div>
          </div>

          <!-- Row 4 -->
          <div class="card span2">
            <h3>${t(this.hass, "quick")}</h3>
            ${this.quickRow(
              "home_target",
              t(this.hass, "roomTarget"),
              settings?.home_target,
            )}
            ${this.quickRow(
              "away_target",
              t(this.hass, "awayTarget"),
              settings?.away_target,
            )}
            ${this.quickRow(
              "radiator_on_below",
              t(this.hass, "onBelow"),
              settings?.radiator_on_below,
            )}
            ${this.quickRow(
              "radiator_off_above",
              t(this.hass, "offAbove"),
              settings?.radiator_off_above,
            )}
          </div>

          <div class="card span2">
            <h3>${t(this.hass, "baseline")}</h3>
            ${this.renderBaseline()}
          </div>

          <!-- Row 5 -->
          <div class="card span2">
            <h3>${t(this.hass, "systemStatus")}</h3>
            <div class="status-list">
              ${this.statusRow("heatpump_available", "Mitsubishi (HVAC)")}
              ${this.statusRow("radiator_available", "Shelly (element)")}
              ${this.statusRow("temperature_stale", t(this.hass, "room"), true)}
              ${this.statusRow("presence", t(this.hass, "presence"))}
            </div>
            <p class="muted" style="margin:12px 0 0">
              ${t(this.hass, "updated")}: ${formatTime(this.hass, zone.last_updated)}
            </p>
          </div>

          <div class="card span2">
            <h3>${t(this.hass, "presence")}</h3>
            <div class="status-list">
              ${(zone.actuators?.presence_entities ?? []).map(
                (entityId) => html`
                  <div class="status-row">
                    <span>${entityId}</span>
                    <span class=${this.hass?.states[entityId]?.state === "home" ? "ok" : "bad"}>
                      ${this.hass?.states[entityId]?.state ?? "–"}
                    </span>
                  </div>
                `,
              )}
              ${(zone.actuators?.presence_entities ?? []).length === 0
                ? html`<p class="empty">${t(this.hass, "noData")}</p>`
                : nothing}
            </div>
            <div class="row" style="margin-top:12px">
              <button @click=${() => this.pressButton("start_baseline")}>
                ${t(this.hass, "startBaseline")}
              </button>
              <button @click=${() => this.pressButton("stop_baseline")}>
                ${t(this.hass, "stopBaseline")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <shc-settings-drawer
        .hass=${this.hass}
        .zone=${zone}
        .open=${this.drawerOpen}
        @shc-close=${() => {
          this.drawerOpen = false;
        }}
        @shc-open-options=${this.openOptions}
      ></shc-settings-drawer>
    `;
  }

  private renderBaseline() {
    const savings = this.zone?.savings;
    const baseline = this.zone?.baseline;
    const max = Math.max(
      savings?.baseline_kwh_per_day ?? 0,
      savings?.comparison_kwh_per_day ?? 0,
      0.001,
    );

    if (!savings?.has_result) {
      return html`
        <p class="empty">${t(this.hass, "noBaseline")}</p>
        <p class="muted">${t(this.hass, "baselineHint")}</p>
        <div class="row">
          <button @click=${() => this.pressButton("start_baseline")}>
            ${t(this.hass, "startBaseline")}
          </button>
          ${baseline?.active
            ? html`<button @click=${() => this.pressButton("stop_baseline")}>
                ${t(this.hass, "stopBaseline")}
              </button>`
            : nothing}
        </div>
      `;
    }

    const before = savings.baseline_kwh_per_day ?? 0;
    const after = savings.comparison_kwh_per_day ?? 0;

    return html`
      <div class="bars">
        <div class="bar before" style="height: ${(before / max) * 100}%">
          ${formatNumber(this.hass, before, 1)}
        </div>
        <div class="bar after" style="height: ${(after / max) * 100}%">
          ${formatNumber(this.hass, after, 1)}
        </div>
      </div>
      <div class="bar-caption">
        <div>
          ${t(this.hass, "before")}<br />(${savings.baseline_days} ${"dygn"})
        </div>
        <div>
          ${t(this.hass, "after")}<br />(${savings.comparison_days} ${"dygn"})
        </div>
      </div>
      <ul class="checklist">
        <li class=${savings.baseline_quality === "measured" ? "" : "warn"}>
          ${savings.baseline_quality === "measured"
            ? "Verkligen mätta data i baslinjen"
            : "Baslinjen är ofullständig"}
        </li>
        <li class=${savings.comparison_quality === "measured" ? "" : "warn"}>
          ${savings.comparison_quality === "measured"
            ? "Verkligen mätta data i jämförelsen"
            : "Jämförelsen är ofullständig"}
        </li>
        <li class=${savings.limited_to_radiator ? "warn" : ""}>
          ${savings.limited_to_radiator
            ? "Endast elementets el mäts"
            : "Mitsubishi + Shelly mäts"}
        </li>
        <li>
          ${savings.baseline_start ?? "–"} → ${savings.baseline_end ?? "–"}
        </li>
      </ul>
    `;
  }

  private quickRow(
    key: string,
    label: string,
    value: number | null | undefined,
  ) {
    const disabled = !this.entity(key);
    return html`
      <div class="quick-row">
        <span class="quick-name">${label}</span>
        <input
          type="range"
          min="5"
          max="30"
          step="0.5"
          .value=${String(value ?? 20)}
          ?disabled=${disabled}
          @change=${(event: Event) =>
            this.setNumber(key, Number((event.target as HTMLInputElement).value))}
        />
        <output>${formatNumber(this.hass, value, 1)} °C</output>
      </div>
    `;
  }

  private statusRow(key: string, label: string, invert = false) {
    const state = this.stateValue(key);
    const ok = invert
      ? state === "off"
      : key === "presence"
        ? state === "on"
        : state === "on";
    return html`
      <div class="status-row">
        <span>${label}</span>
        <span class=${ok ? "ok" : "bad"}>
          ${ok ? t(this.hass, "online") : t(this.hass, "offline")}
        </span>
      </div>
    `;
  }

  private currentRoomTemperature(): number | null {
    const entityId = this.entity("room_temperature");
    const state = entityId ? this.hass?.states[entityId]?.state : undefined;
    const parsed = state !== undefined ? Number(state) : NaN;
    return Number.isFinite(parsed) ? parsed : (this.zone?.room_temperature ?? null);
  }

  private outsideTemperature(): number | null {
    const entityId = this.zone?.actuators?.outside_sensor;
    if (!entityId) {
      return null;
    }
    const state = this.hass?.states[entityId]?.state;
    const parsed = state !== undefined ? Number(state) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }

  private heatpumpHeating(): boolean {
    const entityId = this.zone?.actuators?.climate;
    if (!entityId) {
      return false;
    }
    const state = this.hass?.states[entityId]?.state;
    return state !== undefined && !["off", "unavailable", "unknown"].includes(state);
  }

  private radiatorOn(): boolean {
    const switches = this.zone?.actuators?.switches ?? [];
    return switches.some(
      (entityId) => this.hass?.states[entityId]?.state === "on",
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "smart-heat-dashboard": SmartHeatDashboard;
  }
}
