/** Slide-in settings drawer. Every control performs a real service call. */

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { formatNumber, formatTime, modeLabel, presenceLabel, reasonLabel, t } from "./format";
import { sharedStyles } from "./styles";
import type { HomeAssistant, ZonePayload } from "./types";

type SectionId =
  | "general"
  | "temperatures"
  | "energy"
  | "presence"
  | "advanced";

const SECTIONS: Array<{ id: SectionId; key: Parameters<typeof t>[1] }> = [
  { id: "general", key: "general" },
  { id: "temperatures", key: "temperatures" },
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
