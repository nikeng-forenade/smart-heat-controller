"""Pure heating control logic for Smart Heat Controller.

This module deliberately has **no** Home Assistant imports so that the whole
decision engine can be unit tested without the HA test harness.

Every function here is deterministic: given the same configuration, snapshot
and persisted state it always produces the same decision. All side effects
(service calls, logging) live in :mod:`coordinator`.
"""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import datetime, timedelta
from enum import StrEnum

from .const import MAX_TARGET_TEMP


class Mode(StrEnum):
    """User selectable operating modes."""

    AUTO = "auto"
    HOME = "home"
    AWAY = "away"
    COMFORT = "comfort"
    ECO = "eco"
    BOOST = "boost"
    MANUAL = "manual"
    DISABLED = "disabled"


class Presence(StrEnum):
    """Confirmed presence state for a zone."""

    HOME = "home"
    AWAY = "away"
    UNKNOWN = "unknown"


class Fault(StrEnum):
    """Fault codes that must be visible to the user."""

    TEMPERATURE_MISSING = "temperature_missing"
    TEMPERATURE_STALE = "temperature_stale"
    HEAT_PUMP_UNAVAILABLE = "heat_pump_unavailable"
    RADIATOR_UNAVAILABLE = "radiator_unavailable"
    PRESENCE_UNKNOWN = "presence_unknown"


class FallbackRadiator(StrEnum):
    """Behaviour for the supplementary heater when temperature is unusable."""

    HOLD = "hold"
    ON = "on"
    OFF = "off"


class UnknownPresenceBehaviour(StrEnum):
    """Behaviour when presence cannot be determined."""

    KEEP_LAST = "keep_last"
    HOME = "home"
    AWAY = "away"


class BackupHeating(StrEnum):
    """Reaction when the primary heat pump is unavailable."""

    NONE = "none"
    RADIATOR = "radiator"


@dataclass(frozen=True, slots=True)
class ZoneConfig:
    """Immutable snapshot of the zone settings used by the engine."""

    home_target: float = 21.0
    away_target: float = 18.0
    radiator_on_below: float = 19.0
    radiator_off_above: float = 20.0
    min_safety_temp: float = 16.0
    hysteresis: float = 0.5
    min_on: timedelta = timedelta(minutes=10)
    min_off: timedelta = timedelta(minutes=10)
    stale_after: timedelta = timedelta(minutes=30)
    comfort_offset: float = 1.0
    boost_offset: float = 2.0
    eco_offset: float = -1.0
    fallback_radiator: FallbackRadiator = FallbackRadiator.HOLD
    unknown_presence: UnknownPresenceBehaviour = UnknownPresenceBehaviour.KEEP_LAST
    backup_heating: BackupHeating = BackupHeating.NONE
    dry_run: bool = False


@dataclass(frozen=True, slots=True)
class ZoneSnapshot:
    """A single observation of the zone at ``now``."""

    now: datetime
    room_temperature: float | None = None
    temperature_updated: datetime | None = None
    presence: Presence = Presence.UNKNOWN
    heatpump_available: bool = True
    heatpump_heating: bool = True
    heatpump_cooling: bool = False
    radiator_available: bool = True
    radiator_is_on: bool = False
    heatpump_target: float | None = None
    schedule_target: float | None = None
    price_offset: float = 0.0

    def temperature_age(self) -> timedelta | None:
        if self.temperature_updated is None:
            return None
        return self.now - self.temperature_updated

    @property
    def heatpump_supplying_heat(self) -> bool:
        """True only when the pump is reachable *and* set to a heating mode."""
        return self.heatpump_available and self.heatpump_heating


@dataclass(slots=True)
class ZoneState:
    """Persisted, mutable engine state for one zone."""

    selected_mode: Mode = Mode.AUTO
    radiator_on: bool = False
    radiator_changed_at: datetime | None = None
    # Set when the plug was switched at the device itself: the user is heating
    # the room by hand, so the controller must not fight it until it is released.
    radiator_manual: bool = False
    heatpump_target_command: float | None = None
    last_effective_mode: Mode = Mode.HOME
    override_until: datetime | None = None
    override_previous_mode: Mode | None = None
    boost_until: datetime | None = None

    # Presence tracker bookkeeping
    confirmed_presence: Presence = Presence.UNKNOWN
    candidate_presence: Presence | None = None
    candidate_since: datetime | None = None

    def as_dict(self) -> dict[str, object]:
        return {
            "selected_mode": str(self.selected_mode),
            "radiator_on": self.radiator_on,
            "radiator_changed_at": _iso(self.radiator_changed_at),
            "radiator_manual": self.radiator_manual,
            "heatpump_target_command": self.heatpump_target_command,
            "last_effective_mode": str(self.last_effective_mode),
            "override_until": _iso(self.override_until),
            "override_previous_mode": (
                str(self.override_previous_mode) if self.override_previous_mode else None
            ),
            "boost_until": _iso(self.boost_until),
            "confirmed_presence": str(self.confirmed_presence),
            "candidate_presence": (
                str(self.candidate_presence) if self.candidate_presence else None
            ),
            "candidate_since": _iso(self.candidate_since),
        }

    @classmethod
    def from_dict(cls, data: dict[str, object] | None) -> ZoneState:
        if not data:
            return cls()
        return cls(
            selected_mode=Mode(str(data.get("selected_mode") or Mode.AUTO)),
            radiator_on=bool(data.get("radiator_on", False)),
            radiator_changed_at=_parse(data.get("radiator_changed_at")),
            radiator_manual=bool(data.get("radiator_manual", False)),
            heatpump_target_command=_opt_float(data.get("heatpump_target_command")),
            last_effective_mode=Mode(
                str(data.get("last_effective_mode") or Mode.HOME)
            ),
            override_until=_parse(data.get("override_until")),
            override_previous_mode=(
                Mode(str(data["override_previous_mode"]))
                if data.get("override_previous_mode")
                else None
            ),
            boost_until=_parse(data.get("boost_until")),
            confirmed_presence=Presence(
                str(data.get("confirmed_presence") or Presence.UNKNOWN)
            ),
            candidate_presence=(
                Presence(str(data["candidate_presence"]))
                if data.get("candidate_presence")
                else None
            ),
            candidate_since=_parse(data.get("candidate_since")),
        )


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def _parse(value: object) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value))
    except ValueError:
        return None


def _opt_float(value: object) -> float | None:
    if value is None:
        return None
    try:
        return float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


@dataclass(frozen=True, slots=True)
class Decision:
    """Outcome of one evaluation pass."""

    mode: Mode
    effective_mode: Mode
    presence: Presence
    heatpump_target: float | None = None
    radiator_on: bool | None = None
    reason: str = ""
    faults: tuple[Fault, ...] = ()
    dry_run: bool = False

    @property
    def radiator_command_changed(self) -> bool:
        return self.radiator_on is not None


# ---------------------------------------------------------------------------
# Presence tracking
# ---------------------------------------------------------------------------


def update_presence(
    state: ZoneState,
    raw: Presence,
    now: datetime,
    absence_delay: timedelta,
    arrival_confirm: timedelta,
    unknown_behaviour: UnknownPresenceBehaviour = UnknownPresenceBehaviour.KEEP_LAST,
) -> Presence:
    """Debounce raw presence into a confirmed presence.

    A brief WiFi dropout produces ``Presence.UNKNOWN`` which never flips the
    confirmed state on its own. Going Away requires ``absence_delay`` of
    continuous Away; arriving requires ``arrival_confirm``.

    With ``unknown_behaviour`` set to ``AWAY`` a source that keeps reporting
    nothing is treated as an absence, so a dead phone cannot leave an empty
    house heating forever. The absence delay still protects short dropouts.

    Mutates ``state`` (candidate bookkeeping) and returns the confirmed value.
    """
    if raw is Presence.UNKNOWN:
        if unknown_behaviour is not UnknownPresenceBehaviour.AWAY:
            # Preserve the last known state instead of assuming Away.
            state.candidate_presence = None
            state.candidate_since = None
            return state.confirmed_presence
        raw = Presence.AWAY

    if raw is state.confirmed_presence:
        state.candidate_presence = None
        state.candidate_since = None
        return state.confirmed_presence

    delay = absence_delay if raw is Presence.AWAY else arrival_confirm

    if state.candidate_presence is not raw:
        state.candidate_presence = raw
        state.candidate_since = now
        if delay <= timedelta(0):
            state.confirmed_presence = raw
            state.candidate_presence = None
            state.candidate_since = None
        return state.confirmed_presence

    if state.candidate_since is not None and now - state.candidate_since >= delay:
        state.confirmed_presence = raw
        state.candidate_presence = None
        state.candidate_since = None

    return state.confirmed_presence


# ---------------------------------------------------------------------------
# Mode resolution
# ---------------------------------------------------------------------------


def expire_timers(state: ZoneState, now: datetime) -> None:
    """Expire boost/override timers that have run out."""
    if state.boost_until is not None and now >= state.boost_until:
        state.boost_until = None
        if state.selected_mode is Mode.BOOST:
            state.selected_mode = Mode.AUTO

    if state.override_until is not None and now >= state.override_until:
        state.override_until = None
        if state.override_previous_mode is not None:
            state.selected_mode = state.override_previous_mode
            state.override_previous_mode = None
        else:
            state.selected_mode = Mode.AUTO


def resolve_mode(
    config: ZoneConfig, state: ZoneState, presence: Presence
) -> Mode:
    """Return the effective mode for this evaluation."""
    if state.selected_mode is not Mode.AUTO:
        return state.selected_mode

    if presence is Presence.AWAY:
        return Mode.AWAY
    if presence is Presence.HOME:
        return Mode.HOME

    # Presence unknown: never silently assume Away.
    if config.unknown_presence is UnknownPresenceBehaviour.AWAY:
        return Mode.AWAY
    if config.unknown_presence is UnknownPresenceBehaviour.HOME:
        return Mode.HOME
    return state.last_effective_mode


def _target_for_mode(config: ZoneConfig, mode: Mode) -> float:
    match mode:
        case Mode.AWAY:
            return config.away_target
        case Mode.COMFORT:
            return config.home_target + config.comfort_offset
        case Mode.ECO:
            return config.home_target + config.eco_offset
        case Mode.BOOST:
            return config.home_target + config.boost_offset
        case _:
            return config.home_target


def base_target_for(
    config: ZoneConfig, snapshot: ZoneSnapshot, mode: Mode
) -> float:
    """Setpoint before price adjustment.

    When a weekly schedule is active it supplies the base for the occupied modes;
    away behaviour always uses the away target.
    """
    scheduled = snapshot.schedule_target
    if scheduled is not None and mode in (
        Mode.HOME,
        Mode.COMFORT,
        Mode.ECO,
        Mode.BOOST,
    ):
        match mode:
            case Mode.COMFORT:
                return scheduled + config.comfort_offset
            case Mode.ECO:
                return scheduled + config.eco_offset
            case Mode.BOOST:
                return scheduled + config.boost_offset
            case _:
                return scheduled
    return _target_for_mode(config, mode)


def effective_target(
    config: ZoneConfig, snapshot: ZoneSnapshot, mode: Mode
) -> float:
    """Final setpoint after schedule and price optimisation, clamped to safety."""
    target = base_target_for(config, snapshot, mode) + snapshot.price_offset
    return max(config.min_safety_temp, min(target, MAX_TARGET_TEMP))


def _radiator_band(
    config: ZoneConfig, snapshot: ZoneSnapshot, mode: Mode
) -> tuple[float, float]:
    """Return (on_below, off_above) thresholds for the effective mode.

    The band follows the setpoint: if the schedule or a comfort/eco/boost offset
    moves the target, the radiator thresholds move with it so the two heat
    sources cannot fight each other.
    """
    if mode is Mode.AWAY:
        return (float("-inf"), float("-inf"))

    delta = base_target_for(config, snapshot, mode) - config.home_target
    return (config.radiator_on_below + delta, config.radiator_off_above + delta)


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------


def evaluate(
    config: ZoneConfig,
    snapshot: ZoneSnapshot,
    state: ZoneState,
) -> tuple[Decision, ZoneState]:
    """Evaluate one control cycle.

    Returns the decision plus the new state. The caller is responsible for
    applying the decision and persisting the state.
    """
    state = replace(state)
    expire_timers(state, snapshot.now)

    faults: list[Fault] = []

    temperature = snapshot.room_temperature
    age = snapshot.temperature_age()
    if temperature is None:
        faults.append(Fault.TEMPERATURE_MISSING)
    elif age is None or age > config.stale_after:
        faults.append(Fault.TEMPERATURE_STALE)

    if not snapshot.heatpump_available:
        faults.append(Fault.HEAT_PUMP_UNAVAILABLE)
    if not snapshot.radiator_available:
        faults.append(Fault.RADIATOR_UNAVAILABLE)
    if snapshot.presence is Presence.UNKNOWN:
        faults.append(Fault.PRESENCE_UNKNOWN)

    mode = resolve_mode(config, state, snapshot.presence)

    if mode is Mode.DISABLED:
        return (
            Decision(
                mode=state.selected_mode,
                effective_mode=mode,
                presence=snapshot.presence,
                reason="automation_disabled",
                faults=tuple(faults),
                dry_run=config.dry_run,
            ),
            state,
        )

    if mode is Mode.MANUAL:
        return (
            Decision(
                mode=state.selected_mode,
                effective_mode=mode,
                presence=snapshot.presence,
                heatpump_target=None,
                radiator_on=None,
                reason="manual_mode_no_action",
                faults=tuple(faults),
                dry_run=config.dry_run,
            ),
            state,
        )

    state.last_effective_mode = mode

    temperature_usable = (
        temperature is not None
        and Fault.TEMPERATURE_STALE not in faults
        and Fault.TEMPERATURE_MISSING not in faults
    )

    heatpump_target = _evaluate_heatpump(
        config, snapshot, state, mode, temperature_usable, faults
    )
    radiator_on, reason = _evaluate_radiator(
        config, snapshot, state, mode, temperature_usable, faults
    )

    return (
        Decision(
            mode=state.selected_mode,
            effective_mode=mode,
            presence=snapshot.presence,
            heatpump_target=heatpump_target,
            radiator_on=radiator_on,
            reason=reason,
            faults=tuple(faults),
            dry_run=config.dry_run,
        ),
        state,
    )


def _evaluate_heatpump(
    config: ZoneConfig,
    snapshot: ZoneSnapshot,
    state: ZoneState,
    mode: Mode,
    temperature_usable: bool,
    faults: list[Fault],
) -> float | None:
    """Return the target temperature to send, or None to leave it alone."""
    if not snapshot.heatpump_supplying_heat:
        # The zone is not relying on the heat pump (off/fan_only/dry/cool, or
        # unreachable). Pushing a setpoint could switch the unit back on and
        # override a deliberate choice, so leave it alone.
        return None
    if not snapshot.heatpump_available:
        # Never command an unavailable device; hold the last known target.
        return None
    if not temperature_usable:
        # Without a trustworthy room reading we do not change the setpoint:
        # the heat pump keeps its own internal control running.
        return None

    target = effective_target(config, snapshot, mode)

    previous = state.heatpump_target_command
    if previous is not None and abs(previous - target) < 0.05:
        return None

    state.heatpump_target_command = target
    return target


def _evaluate_radiator(
    config: ZoneConfig,
    snapshot: ZoneSnapshot,
    state: ZoneState,
    mode: Mode,
    temperature_usable: bool,
    faults: list[Fault],
) -> tuple[bool | None, str]:
    """Return the radiator command (None = leave alone) and a reason."""
    if not snapshot.radiator_available:
        # Do not assume it is off and do not spam an offline device.
        return None, "radiator_unavailable"

    if not temperature_usable:
        match config.fallback_radiator:
            case FallbackRadiator.ON:
                return _guard_switch(config, snapshot, state, True, safety=True, reason="fallback_temperature_on")
            case FallbackRadiator.OFF:
                return _guard_switch(config, snapshot, state, False, safety=True, reason="fallback_temperature_off")
            case _:
                return None, "fallback_temperature_hold"

    temperature = snapshot.room_temperature
    assert temperature is not None  # noqa: S101 - guarded above

    # Safety always wins, regardless of mode or timing guards.
    if temperature <= config.min_safety_temp:
        return _guard_switch(
            config, snapshot, state, True, safety=True, reason="minimum_safety_temperature"
        )

    if mode is Mode.AWAY:
        state.radiator_manual = False
        return _guard_switch(config, snapshot, state, False, reason="away")

    if snapshot.heatpump_cooling:
        # The user asked for cooling or dehumidifying. Adding heat would fight
        # the unit, so keep the radiator out of the picture entirely.
        state.radiator_manual = False
        return _guard_switch(
            config, snapshot, state, False, reason="heatpump_cooling_radiator_off"
        )

    if state.radiator_manual:
        # Somebody switched the plug at the device. Honouring that keeps the
        # controller from fighting a person standing next to the radiator; the
        # away rule above still wins so an empty house is never heated.
        return None, "manual_radiator_override"

    if not snapshot.heatpump_supplying_heat and config.backup_heating is BackupHeating.RADIATOR:
        # The heat pump is not heating, so the radiator has to cover the demand.
        # It follows the same setpoint as the pump would, instead of being forced
        # on: the plug has no thermostat of its own.
        target = effective_target(config, snapshot, mode)
        if temperature <= target - config.hysteresis:
            return _guard_switch(
                config, snapshot, state, True, reason="backup_heating_below_target"
            )
        if temperature >= target:
            return _guard_switch(
                config, snapshot, state, False, reason="backup_heating_target_reached"
            )
        return None, "backup_heating_within_hysteresis"

    on_below, off_above = _radiator_band(config, snapshot, mode)

    if temperature <= on_below:
        return _guard_switch(config, snapshot, state, True, reason="temperature_below_on_threshold")

    if temperature >= off_above:
        return _guard_switch(config, snapshot, state, False, reason="temperature_above_off_threshold")

    return None, "within_hysteresis_band"


def _guard_switch(
    config: ZoneConfig,
    snapshot: ZoneSnapshot,
    state: ZoneState,
    want_on: bool,
    *,
    safety: bool = False,
    reason: str,
) -> tuple[bool | None, str]:
    """Honour minimum on/off times unless a safety rule overrides them."""
    if want_on == state.radiator_on:
        return None, f"{reason}_already_in_state"

    if not safety and state.radiator_changed_at is not None:
        elapsed = snapshot.now - state.radiator_changed_at
        limit = config.min_on if state.radiator_on else config.min_off
        if elapsed < limit:
            return None, f"{reason}_blocked_by_min_runtime"

    return want_on, reason
