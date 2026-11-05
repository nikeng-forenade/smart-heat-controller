/** Slide-in settings drawer. Every control performs a real service call. */

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { formatNumber, formatTime, modeLabel, presenceLabel, reasonLabel, t } from "./format";
import { sharedStyles } from "./styles";
import type {
  HomeAssistant,
  PriceSettingsPayload,
  SchedulePayload,
  ScheduleSegment,
  ZonePayload,
} from "./types";

type SectionId =
  | "general"
  | "temperatures"
  | "schedule"
  | "price"
  | "energy"
  | "presence"
  | "advanced";

const SECTIONS: Array<{ id: SectionId; key: Parameters<typeof t>[1] }> = [
  { id: "general", key: "general" },
  { id: "temperatures", key: "temperatures" },
  { id: "schedule", key: "schedule" },
  { id: "price", key: "price" },
  { id: "energy", key: "energyMetering" },
  { id: "presence", key: "presence" },
  { id: "advanced", key: "advanced" },
];

@customElement("shc-settings-drawer")
export class ShcSettingsDrawer extends LitElement {
  static override styles = [
    sharedStyles,
    css`
      :host {
        position: fixed;
        inset: 0;
        z-index: 12;
        pointer-events: none;
      }

      :host([open]) {
        pointer-events: auto;
      }

      .backdrop {
        position: absolute;
        inset: 0;
        background: rgb(15 23 42 / 35%);
        backdrop-filter: blur(1px);
      }

      .drawer {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: min(420px, 100%);
        background: var(--shc-card);
        border-left: 1px solid var(--shc-border);
        display: flex;
        flex-direction: column;
        box-shadow: -8px 0 32px rgb(15 23 42 / 12%);
      }

      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 18px;
        border-bottom: 1px solid var(--shc-border);
      }

      header h2 {
        font-size: 16px;
        margin: 0;
        font-weight: 650;
      }

      .icon {
        border: none;
        background: transparent;
        font-size: 16px;
        padding: 6px 10px;
      }

      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 12px 14px;
        border-bottom: 1px solid var(--shc-border);
      }

      nav button {
        padding: 6px 11px;
        font-size: 13px;
        border-radius: 999px;
      }

      .body {
        flex: 1;
        overflow-y: auto;
        padding: 16px 18px;
      }

      footer {
        padding: 12px 18px;
        border-top: 1px solid var(--shc-border);
      }

      footer button {
        width: 100%;
      }

      .field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 9px 0;
        border-bottom: 1px dashed var(--shc-border);
        font-size: 14px;
      }

      .field span {
        color: var(--shc-muted);
      }

      .field.readonly strong {
        font-weight: 600;
      }

      .slider {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .slider input {
        width: 130px;
        accent-color: var(--shc-blue);
      }

      .slider output {
        min-width: 34px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      .hint {
        color: var(--shc-muted);
        font-size: 12px;
        margin: 8px 0 0;
      }

      .actions {
        display: flex;
        gap: 8px;
        margin-top: 14px;
      }

      .profile {
        margin-top: 16px;
        border-top: 1px solid var(--shc-border);
        padding-top: 12px;
      }

      .profile-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .segment {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }

      .segment input[type="time"],
      .segment input[type="date"] {
        font: inherit;
        font-size: 13px;
        padding: 5px 7px;
        border: 1px solid var(--shc-border);
        border-radius: 8px;
        background: var(--shc-card);
        color: var(--shc-text);
      }

      .segment input[type="number"] {
        width: 66px;
        font: inherit;
        font-size: 13px;
        padding: 5px 7px;
        border: 1px solid var(--shc-border);
        border-radius: 8px;
        background: var(--shc-card);
        color: var(--shc-text);
      }

      button.link {
        border: none;
        background: transparent;
        color: var(--shc-blue);
        padding: 4px 6px;
        font-size: 13px;
      }

      .field input[type="number"] {
        width: 90px;
        font: inherit;
        font-size: 14px;
        padding: 5px 8px;
        border: 1px solid var(--shc-border);
        border-radius: 8px;
        background: var(--shc-card);
        color: var(--shc-text);
      }

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: var(--shc-blue);
      }

      @media (max-width: 720px) {
        .drawer {
          width: 100%;
        }
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ attribute: false }) zone?: ZonePayload;

  @property({ type: Boolean, reflect: true }) open = false;

  @state() private section: SectionId = "general";

  private close(): void {
    this.dispatchEvent(
      new CustomEvent("shc-close", { bubbles: true, composed: true }),
    );
  }

  private entity(key: string): string | undefined {
    return this.zone?.entities?.[key];
  }

  private async setNumber(key: string, value: number): Promise<void> {
    const entityId = this.entity(key);
    if (!entityId || !this.hass) {
      return;
    }
    await this.hass.callService("number", "set_value", {
      entity_id: entityId,
      value,
    });
  }

  private async toggleDryRun(on: boolean): Promise<void> {
    const entityId = this.entity("dry_run");
    if (!entityId || !this.hass) {
      return;
    }
    await this.hass.callService("switch", on ? "turn_on" : "turn_off", {
      entity_id: entityId,
    });
  }

  private async pressButton(key: string): Promise<void> {
    const entityId = this.entity(key);
    if (!entityId || !this.hass) {
      return;
    }
    await this.hass.callService("button", "press", { entity_id: entityId });
  }

  private notifyRefresh(): void {
    this.dispatchEvent(
      new CustomEvent("shc-refresh", { bubbles: true, composed: true }),
    );
  }

  // ------------------------------------------------------------------
  // Schedule
  // ------------------------------------------------------------------
  private currentSchedule(): SchedulePayload {
    return (
      this.zone?.schedule ?? {
        enabled: false,
        weekday: [],
        weekend: [],
      }
    );
  }

  private async saveSchedule(schedule: SchedulePayload): Promise<void> {
    if (!this.hass || !this.zone?.entry_id) {
      return;
    }
    await this.hass.callWS({
      type: "smart_heat_controller/set_schedule",
      entry_id: this.zone.entry_id,
      enabled: schedule.enabled,
      weekday: schedule.weekday,
      weekend: schedule.weekend,
    });
    this.notifyRefresh();
  }

  private scheduleWithSegment(
    profile: "weekday" | "weekend",
    index: number,
    patch: Partial<ScheduleSegment>,
    remove = false,
  ): SchedulePayload {
    const schedule = this.currentSchedule();
    const segments = [...schedule[profile]];

    if (remove) {
      segments.splice(index, 1);
    } else if (index >= segments.length) {
      segments.push({ start: "06:00", target: 21, ...patch });
    } else {
      segments[index] = { ...segments[index], ...patch };
    }

    const sorted = [...segments].sort((a, b) => a.start.localeCompare(b.start));
    return { ...schedule, [profile]: sorted };
  }

  private async saveVacation(start: string | null, end: string | null): Promise<void> {
    if (!this.hass || !this.zone?.entry_id) {
      return;
    }
    await this.hass.callWS({
      type: "smart_heat_controller/set_vacation",
      entry_id: this.zone.entry_id,
      start: start || null,
      end: end || null,
    });
    this.notifyRefresh();
  }

  private renderProfile(profile: "weekday" | "weekend", label: string) {
    const schedule = this.currentSchedule();
    const segments = schedule[profile];

    return html`
      <div class="profile">
        <div class="profile-head">
          <strong>${label}</strong>
          <button
            class="link"
            @click=${() =>
              this.saveSchedule(
                this.scheduleWithSegment(profile, segments.length, {}),
              )}
          >
            + Lägg till
          </button>
        </div>
        ${segments.length === 0
          ? html`<p class="hint">Inga tider – schemat påverkar inte zonen.</p>`
          : segments.map(
              (segment, index) => html`
                <div class="segment">
                  <input
                    type="time"
                    .value=${segment.start}
                    @change=${(event: Event) =>
                      this.saveSchedule(
                        this.scheduleWithSegment(profile, index, {
                          start: (event.target as HTMLInputElement).value,
                        }),
                      )}
                  />
                  <input
                    type="number"
                    min="5"
                    max="30"
                    step="0.5"
                    .value=${String(segment.target)}
                    @change=${(event: Event) =>
                      this.saveSchedule(
                        this.scheduleWithSegment(profile, index, {
                          target: Number((event.target as HTMLInputElement).value),
                        }),
                      )}
                  />
                  <span class="hint">°C</span>
                  <button
                    class="link"
                    aria-label="Ta bort"
                    @click=${() =>
                      this.saveSchedule(
                        this.scheduleWithSegment(profile, index, {}, true),
                      )}
                  >
                    ✕
                  </button>
                </div>
              `,
            )}
      </div>
    `;
  }

  private renderSchedule() {
    const schedule = this.currentSchedule();
    const vacation = this.zone?.vacation;
    const scheduleTarget = this.zone?.schedule_target;

    return html`
      <label class="field">
        <span>Använd veckoschema</span>
        <input
          type="checkbox"
          .checked=${schedule.enabled}
          @change=${(event: Event) =>
            this.saveSchedule({
              ...schedule,
              enabled: (event.target as HTMLInputElement).checked,
            })}
        />
      </label>

      ${schedule.enabled && scheduleTarget != null
        ? html`<p class="hint">
            Schemat sätter nu <strong>${formatNumber(this.hass, scheduleTarget, 1)} °C</strong>.
            Elementets trösklar följer med automatiskt.
          </p>`
        : html`<p class="hint">
            Med schemat av används hemma-/borta-temperaturerna.
          </p>`}

      ${this.renderProfile("weekday", "Vardagar (mån–fre)")}
      ${this.renderProfile("weekend", "Helg (lör–sön)")}

      <div class="profile">
        <div class="profile-head"><strong>Semester</strong></div>
        <div class="segment">
          <input
            type="date"
            .value=${vacation?.start ?? ""}
            @change=${(event: Event) =>
              this.saveVacation(
                (event.target as HTMLInputElement).value,
                vacation?.end ?? null,
              )}
          />
          <span class="hint">till</span>
          <input
            type="date"
            .value=${vacation?.end ?? ""}
            @change=${(event: Event) =>
              this.saveVacation(
                vacation?.start ?? null,
                (event.target as HTMLInputElement).value,
              )}
          />
        </div>
        <p class="hint">
          Under semestern behandlas zonen som borta (endast i Auto-läge).
        </p>
      </div>
    `;
  }

  // ------------------------------------------------------------------
  // Price optimisation
  // ------------------------------------------------------------------
  private currentPrice(): PriceSettingsPayload {
    return (
      this.zone?.price_settings ?? {
        enabled: false,
        cheap_threshold: null,
        expensive_threshold: null,
        max_adjust: 1,
        min_comfort: 18,
      }
    );
  }

  private async savePrice(settings: PriceSettingsPayload): Promise<void> {
    if (!this.hass || !this.zone?.entry_id) {
      return;
    }
    await this.hass.callWS({
      type: "smart_heat_controller/set_price",
      entry_id: this.zone.entry_id,
      enabled: settings.enabled,
      cheap: settings.cheap_threshold,
      expensive: settings.expensive_threshold,
      max_adjust: settings.max_adjust,
      min_comfort: settings.min_comfort,
    });
    this.notifyRefresh();
  }

  private renderPrice() {
    const price = this.currentPrice();
    const decision = this.zone?.price_decision;
    const current = this.zone?.price?.sek_per_kwh;

    return html`
      <label class="field">
        <span>Aktivera prisoptimering</span>
        <input
          type="checkbox"
          .checked=${price.enabled}
          @change=${(event: Event) =>
            this.savePrice({
              ...price,
              enabled: (event.target as HTMLInputElement).checked,
            })}
        />
      </label>

      <div class="field readonly">
        <span>Aktuellt pris</span>
        <strong>
          ${current != null
            ? `${formatNumber(this.hass, current, 2)} SEK/kWh`
            : "inget pris valt"}
        </strong>
      </div>

      ${this.numberField(
        "Billigt under (SEK/kWh)",
        price.cheap_threshold,
        0,
        10,
        0.05,
        (value) => this.savePrice({ ...price, cheap_threshold: value }),
      )}
      ${this.numberField(
        "Dyrt över (SEK/kWh)",
        price.expensive_threshold,
        0,
        10,
        0.05,
        (value) => this.savePrice({ ...price, expensive_threshold: value }),
      )}
      ${this.numberField(
        "Max justering (°C)",
        price.max_adjust,
        0,
        3,
        0.5,
        (value) =>
          this.savePrice({ ...price, max_adjust: value ?? price.max_adjust }),
      )}
      ${this.numberField(
        "Lägsta komfort (°C)",
        price.min_comfort,
        15,
        25,
        0.5,
        (value) =>
          this.savePrice({ ...price, min_comfort: value ?? price.min_comfort }),
      )}

      <p class="hint">
        Vid billigt pris höjs börvärdet högst ${formatNumber(this.hass, price.max_adjust, 1)} °C
        och bara när någon är hemma. Vid dyrt pris sänks det, men aldrig under
        ${formatNumber(this.hass, price.min_comfort, 1)} °C.
      </p>
      ${decision && decision.state !== "disabled"
        ? html`<p class="hint">
            Just nu: ${reasonLabel(this.hass, decision.reason)}
            (${decision.offset > 0 ? "+" : ""}${formatNumber(this.hass, decision.offset, 1)} °C)
          </p>`
        : nothing}
    `;
  }

  private numberField(
    label: string,
    value: number | null | undefined,
    min: number,
    max: number,
    step: number,
    onCommit: (value: number | null) => void,
  ) {
    return html`
      <label class="field">
        <span>${label}</span>
        <input
          type="number"
          min=${min}
          max=${max}
          step=${step}
          .value=${value == null ? "" : String(value)}
          @change=${(event: Event) => {
            const raw = (event.target as HTMLInputElement).value;
            onCommit(raw === "" ? null : Number(raw));
          }}
        />
      </label>
    `;
  }

  override render() {
    if (!this.open) {
      return nothing;
    }

    return html`
      <div class="backdrop" @click=${this.close}></div>
      <aside class="drawer" role="dialog" aria-modal="true" aria-label=${t(this.hass, "settings")}>
        <header>
          <h2>${t(this.hass, "settings")} – ${this.zone?.name ?? ""}</h2>
          <button class="icon" aria-label=${t(this.hass, "close")} @click=${this.close}>
            ✕
          </button>
        </header>

        <nav>
          ${SECTIONS.map(
            (section) => html`
              <button
                class=${this.section === section.id ? "active" : ""}
                @click=${() => {
                  this.section = section.id;
                }}
              >
                ${t(this.hass, section.key)}
              </button>
            `,
          )}
        </nav>

        <div class="body">${this.renderSection()}</div>

        <footer>
          <button
            class="primary"
            @click=${() => {
              const event = new CustomEvent("shc-open-options", {
                bubbles: true,
                composed: true,
              });
              this.dispatchEvent(event);
            }}
          >
            ${t(this.hass, "options")}
          </button>
        </footer>
      </aside>
    `;
  }

  private renderSection() {
    switch (this.section) {
      case "temperatures":
        return this.renderTemperatures();
      case "schedule":
        return this.renderSchedule();
      case "price":
        return this.renderPrice();
      case "energy":
        return this.renderEnergy();
      case "presence":
        return this.renderPresence();
      case "advanced":
        return this.renderAdvanced();
      default:
        return this.renderGeneral();
    }
  }

  private renderGeneral() {
    const dryRunEntity = this.entity("dry_run");
    const dryRun = dryRunEntity
      ? this.hass?.states[dryRunEntity]?.state === "on"
      : false;

    return html`
      <label class="field">
        <span>${t(this.hass, "dryRun")}</span>
        <input
          type="checkbox"
          .checked=${dryRun}
          @change=${(event: Event) =>
            this.toggleDryRun((event.target as HTMLInputElement).checked)}
        />
      </label>
      <p class="hint">${dryRun ? t(this.hass, "dryRunOn") : ""}</p>

      <div class="field readonly">
        <span>${t(this.hass, "presence")}</span>
        <strong>${presenceLabel(this.hass, this.zone?.presence)}</strong>
      </div>
      <div class="field readonly">
        <span>${t(this.hass, "mode")}</span>
        <strong>${modeLabel(this.hass, this.zone?.effective_mode)}</strong>
      </div>
      <div class="field readonly">
        <span>${t(this.hass, "lastDecision")}</span>
        <strong>${reasonLabel(this.hass, this.zone?.reason)}</strong>
      </div>
    `;
  }

  private renderTemperatures() {
    const settings = this.zone?.settings;
    return html`
      ${this.slider("home_target", t(this.hass, "roomTarget"), settings?.home_target, 5, 30, 0.5)}
      ${this.slider("away_target", t(this.hass, "awayTarget"), settings?.away_target, 5, 30, 0.5)}
      ${this.slider(
        "radiator_on_below",
        t(this.hass, "onBelow"),
        settings?.radiator_on_below,
        5,
        30,
        0.5,
      )}
      ${this.slider(
        "radiator_off_above",
        t(this.hass, "offAbove"),
        settings?.radiator_off_above,
        5,
        30,
        0.5,
      )}
      ${this.slider(
        "min_on_minutes",
        "Minsta ON-tid",
        settings?.min_on_minutes,
        0,
        120,
        1,
      )}
      ${this.slider(
        "min_off_minutes",
        "Minsta OFF-tid",
        settings?.min_off_minutes,
        0,
        120,
        1,
      )}
    `;
  }

  private renderEnergy() {
    const radiator = this.zone?.radiator;
    const heatpump = this.zone?.heatpump;
    const price = this.zone?.price;

    return html`
      <div class="field readonly">
        <span>${t(this.hass, "radiator")}</span>
        <strong>${formatNumber(this.hass, radiator?.power_w, 0)} W</strong>
      </div>
      <div class="field readonly">
        <span>${t(this.hass, "heatpump")}</span>
        <strong>${formatNumber(this.hass, heatpump?.power_w, 0)} W</strong>
      </div>
      <div class="field readonly">
        <span>${t(this.hass, "today")} – Mitsubishi</span>
        <strong>${formatNumber(this.hass, heatpump?.kwh_today, 2)} kWh</strong>
      </div>
      <div class="field readonly">
        <span>${t(this.hass, "today")} – Gnosjö</span>
        <strong>${formatNumber(this.hass, radiator?.kwh_today, 2)} kWh</strong>
      </div>
      <div class="field readonly">
        <span>Elpris</span>
        <strong>
          ${price?.sek_per_kwh != null
            ? `${formatNumber(this.hass, price.sek_per_kwh, 2)} SEK/kWh`
            : "–"}
        </strong>
      </div>
      <p class="hint">
        ${price && !price.includes_fees
          ? "Endast spotpris – nätavgift, skatt och moms tillkommer."
          : ""}
      </p>

      <div class="actions">
        <button @click=${() => this.pressButton("start_baseline")}>
          ${t(this.hass, "startBaseline")}
        </button>
        <button @click=${() => this.pressButton("stop_baseline")}>
          ${t(this.hass, "stopBaseline")}
        </button>
      </div>
      <p class="hint">${t(this.hass, "baselineHint")}</p>
    `;
  }

  private renderPresence() {
    const presenceEntity = this.entity("presence");
    const state = presenceEntity ? this.hass?.states[presenceEntity] : undefined;
    const attrs = (state?.attributes ?? {}) as Record<string, unknown>;

    return html`
      <div class="field readonly">
        <span>${t(this.hass, "presence")}</span>
        <strong>${presenceLabel(this.hass, this.zone?.presence)}</strong>
      </div>
      <div class="field readonly">
        <span>Rå status</span>
        <strong>${presenceLabel(this.hass, String(attrs.raw ?? this.zone?.presence_raw ?? ""))}</strong>
      </div>
      <p class="hint">
        Korta WiFi-avbrott påverkar inte läget – frånvaro kräver den konfigurerade
        fördröjningen.
      </p>
    `;
  }

  private renderAdvanced() {
    const faults = this.zone?.faults ?? [];
    return html`
      <div class="field readonly">
        <span>${t(this.hass, "faults")}</span>
        <strong>${faults.length ? faults.join(", ") : t(this.hass, "noFaults")}</strong>
      </div>
      ${this.slider(
        "hysteresis",
        "Hysteres (°C)",
        this.zone?.settings?.hysteresis,
        0.1,
        3,
        0.1,
      )}
      ${this.slider(
        "min_safety_temp",
        "Lägsta säkerhetstemp (°C)",
        this.zone?.settings?.min_safety_temp,
        5,
        25,
        0.5,
      )}
      <p class="hint">
        ${t(this.hass, "updated")}: ${formatTime(this.hass, this.zone?.last_updated)}
      </p>
    `;
  }

  private slider(
    key: string,
    label: string,
    value: number | null | undefined,
    min: number,
    max: number,
    step: number,
  ) {
    const disabled = !this.entity(key);
    return html`
      <label class="field">
        <span>${label}</span>
        <div class="slider">
          <input
            type="range"
            min=${min}
            max=${max}
            step=${step}
            .value=${String(value ?? min)}
            ?disabled=${disabled}
            @change=${(event: Event) =>
              this.setNumber(key, Number((event.target as HTMLInputElement).value))}
          />
          <output>${formatNumber(this.hass, value, step < 1 ? 1 : 0)}</output>
        </div>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "shc-settings-drawer": ShcSettingsDrawer;
  }
}
