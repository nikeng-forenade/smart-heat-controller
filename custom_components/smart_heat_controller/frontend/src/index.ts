/** Card registration entry point. */

// Must run before any element is defined.
import "./version-guard";
import { SmartHeatDashboard } from "./dashboard";
import "./energy-chart";
import "./panel";
import "./settings-drawer";

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "smart-heat-dashboard",
  name: "Smart Heat Controller",
  description:
    "Heating overview, energy, savings and settings for Smart Heat Controller.",
  preview: false,
  documentationURL: "https://github.com/nikeng-forenade/smart-heat-controller",
});

// Make the class reachable for HACS resource registration tooling.
export { SmartHeatDashboard };
