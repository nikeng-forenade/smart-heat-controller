/** Stacked daily energy columns with an overlaid outside-temperature line. */

import { LitElement, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { formatDay, formatNumber, t } from "./format";
import { chartStyles } from "./styles";
import type { DailyPoint, HomeAssistant, HistoryPoint } from "./types";

const W = 520;
const H = 236;
const PAD = { top: 14, right: 38, bottom: 30, left: 34 };

interface Column {
  date: string;
  heatpump: number | null;
  radiator: number | null;
  complete: boolean;
}

@customElement("shc-energy-chart")
export class ShcEnergyChart extends LitElement {
  static override styles = [chartStyles];

  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ attribute: false }) heatpump: DailyPoint[] = [];

  @property({ attribute: false }) radiator: DailyPoint[] = [];

  @property({ attribute: false }) outside: HistoryPoint[] = [];

  @property({ type: Boolean }) loading = false;

  @property({ type: Number }) days = 7;

  @state() private hovered: number | null = null;

  private columns(): Column[] {
    const byDate = new Map<string, Column>();
    for (const point of this.heatpump) {
      byDate.set(point.date, {
        date: point.date,
        heatpump: point.kwh,
        radiator: null,
        complete: point.complete,
      });
    }
    for (const point of this.radiator) {
      const existing = byDate.get(point.date);
      if (existing) {
        existing.radiator = point.kwh;
        existing.complete = existing.complete && point.complete;
      } else {
        byDate.set(point.date, {
          date: point.date,
          heatpump: null,
          radiator: point.kwh,
          complete: point.complete,
        });
      }
    }
    return [...byDate.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-this.days);
  }

  private maxEnergy(columns: Column[]): number {
    const peaks = columns.map(
      (column) => (column.heatpump ?? 0) + (column.radiator ?? 0),
    );
    return Math.max(1, Math.ceil(Math.max(...peaks, 0)));
  }

  override render() {
    const columns = this.columns();

    if (!columns.length) {
      return html`<div class="empty">
        ${this.loading ? "…" : t(this.hass, "noData")}
      </div>`;
    }

    const plotWidth = W - PAD.left - PAD.right;
    const plotHeight = H - PAD.top - PAD.bottom;
    const maxKwh = this.maxEnergy(columns);
    const slot = plotWidth / columns.length;
    const barWidth = Math.min(30, slot * 0.56);

    const temps = this.outside.map((point) => point.y).filter(Number.isFinite);
    const tempMin = temps.length ? Math.min(...temps) : 0;
    const tempMax = temps.length ? Math.max(...temps) : 1;
    const tempSpan = Math.max(1, tempMax - tempMin);
    const tempToY = (value: number) =>
      PAD.top + plotHeight - ((value - tempMin) / tempSpan) * plotHeight;

    const tempPath = this.buildTempPath(columns, tempToY, PAD.left, slot);

    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    return html`
      <div class="chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label=${t(this.hass, "energy")}>
          ${gridLines.map((fraction) => {
            const y = PAD.top + plotHeight * fraction;
            const value = maxKwh * (1 - fraction);
            return svg`
              <line class="grid-line" x1=${PAD.left} y1=${y} x2=${W - PAD.right} y2=${y} />
              <text class="axis-label" x=${PAD.left - 6} y=${y + 3} text-anchor="end">
                ${formatNumber(this.hass, value, 0)}
              </text>
            `;
          })}
          <text class="axis-label" x=${PAD.left - 6} y=${PAD.top - 4} text-anchor="end">
            kWh
          </text>
          <text
            class="axis-label"
            x=${W - PAD.right + 6}
            y=${PAD.top - 4}
            text-anchor="start"
          >
            °C
          </text>

          ${columns.map((column, index) => {
            const x = PAD.left + index * slot + slot / 2 - barWidth / 2;
            const heatpumpKwh = column.heatpump ?? 0;
            const radiatorKwh = column.radiator ?? 0;
            const hpHeight = (heatpumpKwh / maxKwh) * plotHeight;
            const radHeight = (radiatorKwh / maxKwh) * plotHeight;
            const baseY = PAD.top + plotHeight;

            return svg`
              <g
                @mouseenter=${() => {
                  this.hovered = index;
                }}
                @mouseleave=${() => {
                  this.hovered = null;
                }}
              >
                <rect
                  x=${x - slot * 0.22}
                  y=${PAD.top}
                  width=${slot}
                  height=${plotHeight}
                  fill="transparent"
                />
                ${
                  hpHeight > 0
                    ? svg`<rect x=${x} y=${baseY - hpHeight} width=${barWidth} height=${hpHeight}
                        rx="4" fill="var(--shc-blue)" opacity="0.92" />`
                    : nothing
                }
                ${
                  radHeight > 0
                    ? svg`<rect x=${x} y=${baseY - hpHeight - radHeight} width=${barWidth}
                        height=${radHeight} rx="4" fill="var(--shc-orange)" opacity="0.95" />`
                    : nothing
                }
                ${
                  !column.complete
                    ? svg`<title>${t(this.hass, "incomplete")}</title>`
                    : nothing
                }
              </g>
              <text
                class="axis-label"
                x=${PAD.left + index * slot + slot / 2}
                y=${H - 10}
                text-anchor="middle"
              >
                ${formatDay(this.hass, column.date)}
              </text>
            `;
          })}

          ${
            tempPath
              ? svg`<path d=${tempPath} fill="none" stroke="var(--shc-violet)"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
              : nothing
          }
          ${this.outside
            .slice(Math.max(0, this.outside.length - columns.length))
            .map((point, index) => {
              const x = PAD.left + index * slot + slot / 2;
              return svg`<circle cx=${x} cy=${tempToY(point.y)} r="3"
                fill="var(--shc-card)" stroke="var(--shc-violet)" stroke-width="2" />`;
            })}
        </svg>

        ${
          this.hovered !== null && columns[this.hovered]
            ? html`<div
                class="tooltip"
                style="left: ${((PAD.left + this.hovered * slot + slot / 2) / W) * 100}%; top: 0;"
              >
                <strong>${formatDay(this.hass, columns[this.hovered].date)}</strong
                ><br />
                Mitsubishi: ${formatNumber(this.hass, columns[this.hovered].heatpump, 2)} kWh<br />
                Gnosjö: ${formatNumber(this.hass, columns[this.hovered].radiator, 2)} kWh<br />
                ${this.outside[this.hovered]
                  ? `Ute: ${formatNumber(this.hass, this.outside[this.hovered].y, 1)} °C`
                  : ""}
              </div>`
            : nothing
        }
      </div>

      <div class="legend">
        <span><i class="swatch" style="background: var(--shc-blue)"></i>Mitsubishi (kWh)</span>
        <span><i class="swatch" style="background: var(--shc-orange)"></i>Gnosjö (kWh)</span>
        <span><i class="swatch" style="background: var(--shc-violet)"></i
          >${t(this.hass, "outside")} (°C)</span>
      </div>
    `;
  }

  private buildTempPath(
    columns: Column[],
    tempToY: (value: number) => number,
    left: number,
    slot: number,
  ): string | null {
    if (this.outside.length < 2) {
      return null;
    }
    const offset = Math.max(0, this.outside.length - columns.length);
    return this.outside
      .slice(offset, offset + columns.length)
      .map((point, index) => {
        const x = left + index * slot + slot / 2;
        const y = tempToY(point.y);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "shc-energy-chart": ShcEnergyChart;
  }
}
