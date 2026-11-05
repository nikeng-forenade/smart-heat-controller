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
