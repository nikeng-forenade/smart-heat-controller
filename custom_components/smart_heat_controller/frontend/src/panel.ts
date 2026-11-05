/** Full-page sidebar panel. Renders the same dashboard as the card. */

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./dashboard";
import type { HomeAssistant } from "./types";

@customElement("smart-heat-panel")
export class SmartHeatPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
      background: var(--primary-background-color, #f5f8fc);
      box-sizing: border-box;
    }
    smart-heat-dashboard {
      min-height: 100%;
    }
  `;

  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ type: Boolean }) narrow = false;

  override render() {
    return html`<smart-heat-dashboard .hass=${this.hass}></smart-heat-dashboard>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "smart-heat-panel": SmartHeatPanel;
  }
}
