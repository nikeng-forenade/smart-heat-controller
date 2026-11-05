"""Weekly schedule, night setback and vacation handling.

Pure Python (no Home Assistant imports). A schedule is a list of segments per day
profile; each segment sets the heat pump target from its start time until the
next segment starts.

Conflict handling is explicit and deterministic: segments are sorted by start
time, and when two segments share a start time the **later** entry in the list
wins. Before the first segment of a day, the last segment of the previous day
carries over, so a night setback that starts at 22:00 keeps applying after
midnight.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta

WEEKDAY_DAYS = (0, 1, 2, 3, 4)  # Monday..Friday
WEEKEND_DAYS = (5, 6)  # Saturday, Sunday


@dataclass(frozen=True, slots=True)
class ScheduleSegment:
    """A target temperature active from ``start`` until the next segment."""

    start: time
    target: float

    def as_dict(self) -> dict[str, object]:
        return {"start": self.start.strftime("%H:%M"), "target": self.target}

    @classmethod
    def from_dict(cls, data: dict[str, object]) -> ScheduleSegment:
        return cls(start=parse_time(data.get("start")), target=float(data["target"]))


@dataclass(frozen=True, slots=True)
class WeeklySchedule:
    """Weekday and weekend profiles."""

    enabled: bool = False
    weekday: tuple[ScheduleSegment, ...] = ()
    weekend: tuple[ScheduleSegment, ...] = ()

    def segments_for(self, day: date) -> tuple[ScheduleSegment, ...]:
        return self.weekday if day.weekday() in WEEKDAY_DAYS else self.weekend

    def is_empty(self) -> bool:
        return not self.weekday and not self.weekend

    def as_dict(self) -> dict[str, object]:
        return {
            "enabled": self.enabled,
            "weekday": [segment.as_dict() for segment in self.weekday],
            "weekend": [segment.as_dict() for segment in self.weekend],
        }

    @classmethod
    def from_dict(cls, data: dict[str, object] | None) -> WeeklySchedule:
        if not data:
            return cls()
        return cls(
            enabled=bool(data.get("enabled", False)),
            weekday=_parse_segments(data.get("weekday")),
            weekend=_parse_segments(data.get("weekend")),
        )


def _parse_segments(value: object) -> tuple[ScheduleSegment, ...]:
    if not isinstance(value, list):
        return ()
    segments = [
        ScheduleSegment.from_dict(item)
        for item in value
        if isinstance(item, dict) and item.get("target") is not None
    ]
    return normalise(segments)


def normalise(segments: list[ScheduleSegment]) -> tuple[ScheduleSegment, ...]:
    """Sort by start time; a later duplicate start overrides an earlier one."""
    ordered = sorted(enumerate(segments), key=lambda pair: (pair[1].start, pair[0]))
    deduped: dict[time, ScheduleSegment] = {}
    for _, segment in ordered:
        deduped[segment.start] = segment
    return tuple(deduped[key] for key in sorted(deduped))


def parse_time(value: object) -> time:
    """Accept ``HH:MM`` strings, ``HH:MM:SS`` strings or real ``time`` objects."""
    if isinstance(value, time):
        return value
    text = str(value or "").strip()
    parts = text.split(":")
    if len(parts) < 2:
        return time(0, 0)
    try:
        return time(int(parts[0]), int(parts[1]))
    except ValueError:
        return time(0, 0)


def resolve(schedule: WeeklySchedule, now: datetime) -> float | None:
    """Return the scheduled target for ``now``, or ``None`` when inactive."""
    if not schedule.enabled or schedule.is_empty():
        return None

    today_segments = schedule.segments_for(now.date())
    current = now.time()

    active: float | None = None
    for segment in today_segments:
        if segment.start <= current:
            active = segment.target

    if active is not None:
        return active

    # Carry over yesterday's last segment (night spanning midnight).
    yesterday = now.date() - timedelta(days=1)
    previous = schedule.segments_for(yesterday)
    if previous:
        return previous[-1].target

    # No earlier segment today and yesterday had none: use today's first.
    if today_segments:
        return today_segments[0].target
    return None


@dataclass(frozen=True, slots=True)
class Vacation:
    """A date range during which the zone behaves as away."""

    start: date | None = None
    end: date | None = None

    @property
    def configured(self) -> bool:
        return self.start is not None and self.end is not None

    def active(self, today: date) -> bool:
        if self.start is None or self.end is None:
            return False
        return self.start <= today <= self.end

    def as_dict(self) -> dict[str, object]:
        return {
            "start": self.start.isoformat() if self.start else None,
            "end": self.end.isoformat() if self.end else None,
            "configured": self.configured,
        }

    @classmethod
    def from_dict(cls, data: dict[str, object] | None) -> Vacation:
        if not data:
            return cls()
        start = data.get("start")
        end = data.get("end")
        return cls(
            start=date.fromisoformat(str(start)) if start else None,
            end=date.fromisoformat(str(end)) if end else None,
        )


DEFAULT_WEEKDAY: tuple[ScheduleSegment, ...] = (
    ScheduleSegment(start=time(6, 0), target=21.0),
    ScheduleSegment(start=time(22, 0), target=18.0),
)

DEFAULT_WEEKEND: tuple[ScheduleSegment, ...] = (
    ScheduleSegment(start=time(8, 0), target=21.0),
    ScheduleSegment(start=time(23, 0), target=18.0),
)


def default_schedule() -> WeeklySchedule:
    """Sensible starting point shown in the UI, disabled by default."""
    return WeeklySchedule(
        enabled=False,
        weekday=DEFAULT_WEEKDAY,
        weekend=DEFAULT_WEEKEND,
    )
