import { css } from "lit";

/**
 * Design tokens follow the active Home Assistant theme, with the approved
 * light mockup values as fallbacks.
 */
export const sharedStyles = css`
  :host {
    --shc-bg: var(--primary-background-color, #f5f8fc);
    --shc-card: var(--card-background-color, #ffffff);
    --shc-border: var(--divider-color, #e4eaf2);
    --shc-text: var(--primary-text-color, #0f172a);
    --shc-muted: var(--secondary-text-color, #5a6b84);
    --shc-blue: var(--primary-color, #1e6fe8);
    --shc-blue-soft: color-mix(in srgb, var(--shc-blue) 12%, transparent);
    --shc-green: #16a34a;
    --shc-green-soft: color-mix(in srgb, #16a34a 12%, transparent);
    --shc-orange: #f59e0b;
    --shc-violet: #8b5cf6;
    --shc-red: #dc2626;
    --shc-radius: 16px;
    --shc-shadow: 0 1px 2px rgb(15 23 42 / 6%), 0 8px 24px rgb(15 23 42 / 4%);
    display: block;
    color: var(--shc-text);
    font-family: var(
      --paper-font-common-base_-_font-family,
      system-ui,
      -apple-system,
      "Segoe UI",
      Roboto,
      sans-serif
    );
  }

  .card {
    background: var(--shc-card);
    border: 1px solid var(--shc-border);
    border-radius: var(--shc-radius);
    box-shadow: var(--shc-shadow);
    padding: 18px 20px;
    box-sizing: border-box;
    min-width: 0;
  }

  .card h2,
  .card h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 650;
    letter-spacing: -0.01em;
  }

  .label {
    color: var(--shc-muted);
    font-size: 13px;
    font-weight: 500;
  }

  .value {
    font-size: 30px;
    font-weight: 680;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .value.small {
    font-size: 20px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .spread {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    background: var(--shc-blue-soft);
    color: var(--shc-blue);
  }

  .pill.ok {
    background: var(--shc-green-soft);
    color: var(--shc-green);
  }

  .pill.warn {
    background: color-mix(in srgb, var(--shc-orange) 16%, transparent);
    color: #b45309;
  }

  .pill.bad {
    background: color-mix(in srgb, var(--shc-red) 14%, transparent);
    color: var(--shc-red);
  }

  .quality {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 6px;
    padding: 2px 6px;
    border: 1px solid var(--shc-border);
    color: var(--shc-muted);
  }

  .quality.measured {
    color: var(--shc-green);
    border-color: color-mix(in srgb, var(--shc-green) 35%, transparent);
  }

  .quality.estimated {
    color: #b45309;
    border-color: color-mix(in srgb, var(--shc-orange) 40%, transparent);
  }

  .quality.incomplete,
  .quality.missing {
    color: var(--shc-red);
    border-color: color-mix(in srgb, var(--shc-red) 30%, transparent);
  }

  button {
    font: inherit;
    cursor: pointer;
    border-radius: 12px;
    border: 1px solid var(--shc-border);
    background: var(--shc-card);
    color: var(--shc-text);
    padding: 10px 14px;
    transition: background 120ms ease, border-color 120ms ease;
  }

  button:hover {
    border-color: color-mix(in srgb, var(--shc-blue) 45%, var(--shc-border));
  }

  button:focus-visible {
    outline: 2px solid var(--shc-blue);
    outline-offset: 2px;
  }

  button.primary {
    background: var(--shc-blue);
    border-color: var(--shc-blue);
    color: #fff;
  }

  button.active {
    background: var(--shc-blue);
    border-color: var(--shc-blue);
    color: #fff;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .muted {
    color: var(--shc-muted);
    font-size: 13px;
  }

  .empty {
    color: var(--shc-muted);
    font-size: 14px;
    padding: 12px 0;
  }

  .bar-track {
    position: relative;
    height: 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--shc-muted) 18%, transparent);
    overflow: hidden;
  }

  .bar-fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 999px;
    background: var(--shc-blue);
  }

  .grid-gap {
    gap: 14px;
  }

  @media (max-width: 720px) {
    .value {
      font-size: 25px;
    }
    .card {
      padding: 14px 16px;
    }
  }
`;

export const chartStyles = css`
  .chart-wrap {
    position: relative;
    width: 100%;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .axis-label {
    fill: var(--shc-muted);
    font-size: 10px;
    font-family: inherit;
  }
  .grid-line {
    stroke: var(--shc-border);
    stroke-width: 1;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--shc-muted);
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }
  .tooltip {
    position: absolute;
    pointer-events: none;
    background: var(--shc-card);
    border: 1px solid var(--shc-border);
    border-radius: 10px;
    box-shadow: var(--shc-shadow);
    padding: 8px 10px;
    font-size: 12px;
    line-height: 1.4;
    white-space: nowrap;
    transform: translate(-50%, -120%);
    z-index: 5;
  }
`;
