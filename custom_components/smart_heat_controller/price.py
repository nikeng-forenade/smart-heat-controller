"""Electricity price handling.

Distinguishes a bare spot price from an all-in retail price so the UI never
claims a full retail cost from spot price alone.
"""

from __future__ import annotations

from dataclasses import dataclass

from .const import QUALITY_ESTIMATED, QUALITY_MEASURED, QUALITY_MISSING


@dataclass(slots=True)
class PriceInfo:
    """Resolved price for cost calculations."""

    sek_per_kwh: float | None = None
    quality: str = QUALITY_MISSING
    source: str = "none"
    includes_fees: bool = False

    @property
    def available(self) -> bool:
        return self.sek_per_kwh is not None

    def as_dict(self) -> dict[str, object]:
        return {
            "sek_per_kwh": self.sek_per_kwh,
            "quality": self.quality,
            "source": self.source,
            "includes_fees": self.includes_fees,
        }


@dataclass(frozen=True, slots=True)
class PriceSettings:
    """User configuration for optional price optimisation."""

    enabled: bool = False
    cheap_threshold: float | None = None
    expensive_threshold: float | None = None
    max_adjust: float = 1.0
    min_comfort: float = 18.0

    def as_dict(self) -> dict[str, object]:
        return {
            "enabled": self.enabled,
            "cheap_threshold": self.cheap_threshold,
            "expensive_threshold": self.expensive_threshold,
            "max_adjust": self.max_adjust,
            "min_comfort": self.min_comfort,
        }


@dataclass(frozen=True, slots=True)
class PriceDecision:
    """Outcome of the price optimiser for one evaluation."""

    offset: float = 0.0
    state: str = "disabled"
    reason: str = ""

    @property
    def active(self) -> bool:
        return abs(self.offset) > 1e-9


def optimise_for_price(
    price: float | None,
    settings: PriceSettings,
    *,
    base_target: float,
    presence_home: bool,
) -> PriceDecision:
    """Return a modest setpoint offset based on the current price.

    Preheating only happens while somebody is home, is capped by ``max_adjust``
    and never exceeds the base target by more than that. Setbacks never go below
    ``min_comfort``.

    The offset is intentionally small: raising the setpoint by more than a degree
    or two mostly increases heat loss instead of storing useful energy in a
    lightweight building.
    """
    if not settings.enabled:
        return PriceDecision(state="disabled", reason="price_optimisation_off")
    if price is None:
        return PriceDecision(state="unknown", reason="no_price_available")

    cheap = settings.cheap_threshold
    expensive = settings.expensive_threshold

    if cheap is not None and price <= cheap:
        if not presence_home:
            return PriceDecision(
                state="cheap", reason="cheap_price_but_nobody_home"
            )
        offset = max(0.0, settings.max_adjust)
        return PriceDecision(offset=offset, state="cheap", reason="preheat_cheap_price")

    if expensive is not None and price >= expensive:
        floor = max(settings.min_comfort, base_target - settings.max_adjust)
        offset = min(0.0, floor - base_target)
        if abs(offset) < 1e-9:
            return PriceDecision(
                state="expensive", reason="setback_blocked_by_comfort_floor"
            )
        return PriceDecision(
            offset=offset, state="expensive", reason="setback_expensive_price"
        )

    return PriceDecision(state="normal", reason="price_within_normal_range")


def resolve_price(
    *,
    sensor_price: float | None,
    all_in_price: float | None,
) -> PriceInfo:
    """Pick the most trustworthy price source.

    A user entered all-in price (spot + network + tax + VAT) is preferred
    because it produces a real cost figure. A live spot sensor is used
    otherwise and marked as estimated.
    """
    if all_in_price is not None and all_in_price > 0:
        return PriceInfo(
            sek_per_kwh=all_in_price,
            quality=QUALITY_MEASURED,
            source="all_in_price",
            includes_fees=True,
        )
    if sensor_price is not None and sensor_price >= 0:
        return PriceInfo(
            sek_per_kwh=sensor_price,
            quality=QUALITY_ESTIMATED,
            source="price_sensor",
            includes_fees=False,
        )
    return PriceInfo()


def estimate_cost(kwh: float, price: PriceInfo) -> float | None:
    """Return cost in SEK, or ``None`` when no price is available."""
    if not price.available or price.sek_per_kwh is None:
        return None
    return round(kwh * price.sek_per_kwh, 2)
