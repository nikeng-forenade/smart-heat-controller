/** Touch friendly − / + control shared by the dashboard and the settings drawer. */

import { html, nothing } from "lit";
import { formatNumber, t } from "./format";
import type { HomeAssistant } from "./types";

export interface StepperOptions {
  hass?: HomeAssistant;
  value: number | null | undefined;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  unit?: string;
  digits?: number;
  onStep: (value: number) => void;
}

export function stepper(options: StepperOptions) {
  const { hass, value, min, max, step, disabled = false } = options;
  const unit = options.unit ?? "°C";
  const digits = options.digits ?? (step < 1 ? 1 : 0);
  const current = value ?? min;

  const emit = (next: number): void => {
    const snapped = Math.round(next / step) * step;
    const clamped = Math.min(max, Math.max(min, snapped));
    options.onStep(Number(clamped.toFixed(2)));
  };

  return html`
    <div class="stepper">
      <button
        type="button"
        aria-label=${t(hass, "decrease")}
        ?disabled=${disabled}
        @click=${() => emit(current - step)}
      >
        −
      </button>
      <output>${formatNumber(hass, value, digits)}${unit ? html` ${unit}` : nothing}</output>
      <button
        type="button"
        aria-label=${t(hass, "increase")}
        ?disabled=${disabled}
        @click=${() => emit(current + step)}
      >
        +
      </button>
    </div>
  `;
}
