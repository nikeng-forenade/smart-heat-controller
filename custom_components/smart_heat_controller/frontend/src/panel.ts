/** Full-page sidebar panel. Renders the same dashboard as the card. */

import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./dashboard";
import type { HomeAssistant } from "./types";

// mdi:menu
const MENU_ICON = "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z";

@customElement("smart-heat-panel")
export class SmartHeatPanel extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color, #f5f8fc);
      box-sizing: border-box;
    }

    /* Same toolbar as Home Assistant's own panels, so the mobile app has a
       way back to the sidebar without the Android back button. */
    .toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 0 0 auto;
      height: var(--header-height, 56px);
      padding: 0 12px 0 4px;
      padding-top: env(safe-area-inset-top);
      box-sizing: content-box;
      background: var(--app-header-background-color, var(--primary-color, #03a9f4));
      color: var(--app-header-text-color, var(--text-primary-color, #fff));
      border-bottom: var(--app-header-border-bottom, none);
    }

    .toolbar.wide {
      padding-left: 16px;
    }

    .menu {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }

    .menu:hover,
    .menu:focus-visible {
      background: rgba(255, 255, 255, 0.12);
      outline: none;
    }

    .menu svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    .title {
      font-size: 20px;
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .content {
      flex: 1 1 auto;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }

    smart-heat-dashboard {
      min-height: 100%;
    }
  `;

  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ type: Boolean }) narrow = false;

  @property({ attribute: false }) panel?: { title?: string | null };

  /** The menu button is needed on phones and whenever the sidebar is hidden. */
  private get showMenu(): boolean {
    const docked = (this.hass as { dockedSidebar?: string } | undefined)?.dockedSidebar;
    return this.narrow || docked === "always_hidden";
  }

  private toggleMenu(): void {
    // Home Assistant's main view listens for this event: it opens the drawer
    // on a phone and toggles the docked sidebar on a desktop.
    this.dispatchEvent(
      new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }),
    );
  }

  override render() {
    const showMenu = this.showMenu;
    return html`
      <div class="toolbar ${showMenu ? "" : "wide"}">
        ${showMenu
          ? html`<button class="menu" aria-label="Menu" @click=${this.toggleMenu}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${MENU_ICON}></path></svg>
            </button>`
          : nothing}
        <div class="title">${this.panel?.title || "Smart Heat"}</div>
      </div>
      <div class="content">
        <smart-heat-dashboard .hass=${this.hass}></smart-heat-dashboard>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "smart-heat-panel": SmartHeatPanel;
  }
}
