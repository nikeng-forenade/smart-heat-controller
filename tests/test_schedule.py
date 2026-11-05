"""Tests for the weekly schedule and vacation logic."""

from __future__ import annotations

from datetime import date, datetime, time

import pytest

from custom_components.smart_heat_controller.schedule import (
    ScheduleSegment,
    Vacation,
    WeeklySchedule,
    default_schedule,
    normalise,
    parse_time,
    resolve,
)

WEEKDAY = datetime(2026, 11, 4, 12, 0)  # Wednesday
MONDAY = datetime(2026, 11, 2, 12, 0)
SATURDAY = datetime(2026, 11, 7, 12, 0)
SUNDAY = datetime(2026, 11, 8, 12, 0)


def build(enabled: bool = True) -> WeeklySchedule:
    return WeeklySchedule(
        enabled=enabled,
        weekday=(
            ScheduleSegment(start=time(6, 0), target=21.0),
            ScheduleSegment(start=time(22, 0), target=18.0),
        ),
        weekend=(
            ScheduleSegment(start=time(8, 0), target=22.0),
            ScheduleSegment(start=time(23, 0), target=18.0),
        ),
    )


def test_disabled_schedule_returns_none():
    assert resolve(build(enabled=False), WEEKDAY) is None


def test_empty_schedule_returns_none():
    assert resolve(WeeklySchedule(enabled=True), WEEKDAY) is None


def test_daytime_segment_is_active():
    assert resolve(build(), WEEKDAY.replace(hour=12)) == pytest.approx(21.0)


def test_night_segment_takes_over():
    assert resolve(build(), WEEKDAY.replace(hour=23)) == pytest.approx(18.0)


def test_before_first_segment_carries_over_previous_day():
    # 03:00 Wednesday has no segment yet, so Tuesday's 22:00 setback applies.
    at_night = WEEKDAY.replace(hour=3)
    assert resolve(build(), at_night) == pytest.approx(18.0)


def test_monday_night_carries_over_from_sunday_weekend_profile():
    # Sunday's last segment (23:00 -> 18) is still in force at 03:00 Monday.
    at_night = MONDAY.replace(hour=3)
    assert resolve(build(), at_night) == pytest.approx(18.0)


def test_weekend_profile_used_on_saturday_and_sunday():
    assert resolve(build(), SATURDAY.replace(hour=12)) == pytest.approx(22.0)
    assert resolve(build(), SATURDAY.replace(hour=23, minute=30)) == pytest.approx(18.0)
    assert resolve(build(), SUNDAY.replace(hour=9)) == pytest.approx(22.0)


def test_duplicate_start_time_last_entry_wins():
    segments = normalise(
        [
            ScheduleSegment(start=time(6, 0), target=20.0),
            ScheduleSegment(start=time(6, 0), target=22.0),
        ]
    )
    assert len(segments) == 1
    assert segments[0].target == pytest.approx(22.0)


def test_segments_are_sorted_by_start():
    segments = normalise(
        [
            ScheduleSegment(start=time(22, 0), target=18.0),
            ScheduleSegment(start=time(6, 0), target=21.0),
        ]
    )
    assert [segment.start for segment in segments] == [time(6, 0), time(22, 0)]


@pytest.mark.parametrize(
    ("raw", "expected"),
    [("06:30", time(6, 30)), ("18:00:00", time(18, 0)), (time(7, 15), time(7, 15))],
)
def test_parse_time_accepts_common_shapes(raw, expected):
    assert parse_time(raw) == expected


def test_parse_time_is_lenient_with_garbage():
    assert parse_time("nonsense") == time(0, 0)
    assert parse_time(None) == time(0, 0)


def test_roundtrip():
    restored = WeeklySchedule.from_dict(build().as_dict())
    assert restored.enabled is True
    assert restored.weekday[1].target == pytest.approx(18.0)


def test_default_schedule_is_disabled_but_populated():
    schedule = default_schedule()
    assert schedule.enabled is False
    assert len(schedule.weekday) == 2
    assert len(schedule.weekend) == 2


def test_vacation_window():
    vacation = Vacation(start=date(2026, 12, 20), end=date(2026, 12, 31))
    assert vacation.active(date(2026, 12, 20)) is True
    assert vacation.active(date(2026, 12, 31)) is True
    assert vacation.active(date(2027, 1, 1)) is False
    assert vacation.active(date(2026, 12, 19)) is False


def test_unconfigured_vacation_is_never_active():
    vacation = Vacation()
    assert vacation.configured is False
    assert vacation.active(date(2026, 12, 20)) is False


def test_vacation_roundtrip():
    original = Vacation(start=date(2026, 12, 20), end=date(2026, 12, 31))
    assert Vacation.from_dict(original.as_dict()) == original
