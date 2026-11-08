"""Runtime coordinator for Smart Heat Controller.

Owns the control loop, the energy ledger and persistence. Entities are a thin
projection of :attr:`SmartHeatCoordinator.data`.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field, replace
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_UNIT_OF_MEASUREMENT,
    STATE_ON,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
)
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .baseline import BaselinePeriod, SavingsResult, compare, radiator_savings_only
from .const import (
    CONF_ABSENCE_DELAY,
    CONF_ALL_IN_PRICE,
    CONF_ARRIVAL_CONFIRM,
    CONF_AWAY_TARGET,
    CONF_BACKUP_HEATING,
    CONF_BOOST_DURATION,
    CONF_DRY_RUN,
    CONF_FALLBACK_RADIATOR,
    CONF_HEATPUMP_ENERGY_SENSOR,
    CONF_HEATPUMP_POWER_SENSOR,
    CONF_HOME_TARGET,
    CONF_HYSTERESIS,
    CONF_MIN_OFF_MINUTES,
    CONF_MIN_ON_MINUTES,
    CONF_MIN_SAFETY_TEMP,
    CONF_OUTSIDE_TEMPERATURE_SENSOR,
    CONF_PRICE_CHEAP,
    CONF_PRICE_EXPENSIVE,
    CONF_PRICE_MAX_ADJUST,
    CONF_PRICE_MIN_COMFORT,
    CONF_PRICE_OPTIMIZATION,
    CONF_PRICE_SENSOR,
    CONF_PRICE_SURCHARGE,
    CONF_PRIMARY_CLIMATE,
    CONF_PRESENCE_ENTITIES,
    CONF_RADIATOR_OFF_ABOVE,
    CONF_RADIATOR_ON_BELOW,
    CONF_SCHEDULE,
    CONF_STALE_TIMEOUT,
    CONF_SUPPLEMENTARY_ENERGY_SENSOR,
    CONF_SUPPLEMENTARY_NOMINAL_POWER,
    CONF_SUPPLEMENTARY_POWER_SENSOR,
    CONF_SUPPLEMENTARY_SWITCHES,
    CONF_TEMPERATURE_OFFSET,
    CONF_TEMPERATURE_SENSOR,
    CONF_UNKNOWN_BEHAVIOR,
    CONF_VACATION_END,
    CONF_VACATION_START,
    CONF_ZONE_NAME,
    DEFAULT_PRICE_MAX_ADJUST,
    DEFAULT_PRICE_MIN_COMFORT,
    DOMAIN,
    LEDGER_RETENTION_DAYS,
    QUALITY_ESTIMATED,
    QUALITY_MEASURED,
    QUALITY_MISSING,
    SOURCE_HEATPUMP,
    SOURCE_RADIATOR,
    SOURCE_TOTAL,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .controller import (
    BackupHeating,
    Decision,
    FallbackRadiator,
    Mode,
    Presence,
    UnknownPresenceBehaviour,
    ZoneConfig,
    ZoneSnapshot,
    ZoneState,
    base_target_for,
    evaluate,
    effective_target,
    update_presence,
)
from .energy import (
    CounterTracker,
    EnergyLedger,
    EnergyTotal,
    PowerIntegrator,
    period_month,
    period_today,
    period_week,
    to_kwh,
)
from .price import (
    PriceDecision,
    PriceInfo,
    PriceSettings,
    estimate_cost,
    optimise_for_price,
    resolve_price,
)
from .schedule import Vacation, WeeklySchedule, resolve as resolve_schedule
from .weather import TemperatureLedger

_LOGGER = logging.getLogger(__name__)

TICK = timedelta(seconds=30)
PRESENCE_TIMEOUT = timedelta(minutes=30)
HOME_STATES = {STATE_ON, "home"}

# HVAC modes in which the heat pump can actually deliver heat.
HEATING_HVAC_MODES = frozenset({"heat", "heat_cool", "auto"})

# HVAC modes in which the pump is deliberately removing heat or humidity; the
# radiator must not add heat against it.
COOLING_HVAC_MODES = frozenset({"cool", "dry"})

# How long a commanded radiator state may stay out of sync with the device
# before the difference is treated as a change made outside the controller.
COMMAND_SETTLE = timedelta(seconds=60)


@dataclass(slots=True)
class SourceSnapshot:
    """Live view of one measured load."""

    power_w: float | None = None
    kwh_today: float | None = None
    quality: str = QUALITY_MISSING
    available: bool = False


@dataclass(slots=True)
class ZoneData:
    """Everything the entities and the frontend need for one zone."""

    snapshot: ZoneSnapshot
    decision: Decision
    presence_raw: Presence
    radiator: SourceSnapshot
    heatpump: SourceSnapshot
    totals: dict[str, dict[str, EnergyTotal]] = field(default_factory=dict)
    costs: dict[str, dict[str, float | None]] = field(default_factory=dict)
    price: PriceInfo = field(default_factory=PriceInfo)
    savings: SavingsResult | None = None
    savings_warning: str | None = None
    outside_temperature: float | None = None
    schedule_target: float | None = None
    price_decision: PriceDecision = field(default_factory=PriceDecision)
    last_updated: datetime | None = None


class SmartHeatCoordinator(DataUpdateCoordinator[ZoneData]):
    """Event driven control loop for a single heating zone."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN}:{entry.title}",
            update_interval=None,
        )
        self.entry = entry
        self.zone_name: str = entry.title
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, f"{STORAGE_KEY}.{entry.entry_id}"
        )
        self._state = ZoneState()
        self._ledger = EnergyLedger()
        self._baseline = BaselinePeriod()
        self._radiator_counter = CounterTracker(max_gap=timedelta(hours=2))
        self._heatpump_counter = CounterTracker(max_gap=timedelta(hours=2))
        self._radiator_integrator = PowerIntegrator()
        self._heatpump_integrator = PowerIntegrator()
        self._unsubscribers: list[Any] = []
        self._applying = False
        self._last_presence_raw = Presence.UNKNOWN
        self._loaded = False
        self._schedule = WeeklySchedule()
        self._vacation = Vacation()
        self._temperatures = TemperatureLedger()
        self._price_decision = PriceDecision()
        self._schedule_target: float | None = None
        self._last_radiator_command_at: datetime | None = None

    # ------------------------------------------------------------------
    # Configuration helpers
    # ------------------------------------------------------------------
    @property
    def config_data(self) -> dict[str, Any]:
        return {**self.entry.data, **self.entry.options}

    @property
    def zone_config(self) -> ZoneConfig:
        conf = self.config_data
        return ZoneConfig(
            home_target=float(conf.get(CONF_HOME_TARGET, 21.0)),
            away_target=float(conf.get(CONF_AWAY_TARGET, 18.0)),
            radiator_on_below=float(conf.get(CONF_RADIATOR_ON_BELOW, 19.0)),
            radiator_off_above=float(conf.get(CONF_RADIATOR_OFF_ABOVE, 20.0)),
            min_safety_temp=float(conf.get(CONF_MIN_SAFETY_TEMP, 16.0)),
            hysteresis=float(conf.get(CONF_HYSTERESIS, 0.5)),
            min_on=timedelta(minutes=float(conf.get(CONF_MIN_ON_MINUTES, 10))),
            min_off=timedelta(minutes=float(conf.get(CONF_MIN_OFF_MINUTES, 10))),
            stale_after=timedelta(minutes=float(conf.get(CONF_STALE_TIMEOUT, 30))),
            fallback_radiator=FallbackRadiator(
                str(conf.get(CONF_FALLBACK_RADIATOR, FallbackRadiator.HOLD.value))
            ),
            unknown_presence=UnknownPresenceBehaviour(
                str(
                    conf.get(
                        CONF_UNKNOWN_BEHAVIOR, UnknownPresenceBehaviour.KEEP_LAST.value
                    )
                )
            ),
            backup_heating=BackupHeating(
                str(conf.get(CONF_BACKUP_HEATING, BackupHeating.NONE.value))
            ),
            dry_run=bool(conf.get(CONF_DRY_RUN, False)),
        )

    @property
    def zone_state(self) -> ZoneState:
        return self._state

    @property
    def baseline(self) -> BaselinePeriod:
        return self._baseline

    @property
    def ledger(self) -> EnergyLedger:
        return self._ledger

    @property
    def boost_duration(self) -> timedelta:
        return timedelta(
            minutes=float(self.config_data.get(CONF_BOOST_DURATION, 60))
        )

    @property
    def schedule(self) -> WeeklySchedule:
        return self._schedule

    @property
    def vacation(self) -> Vacation:
        return self._vacation

    @property
    def temperature_ledger(self) -> TemperatureLedger:
        return self._temperatures

    @property
    def price_decision(self) -> PriceDecision:
        return self._price_decision

    @property
    def schedule_target(self) -> float | None:
        return self._schedule_target

    @property
    def price_settings(self) -> PriceSettings:
        conf = self.config_data
        return PriceSettings(
            enabled=bool(conf.get(CONF_PRICE_OPTIMIZATION, False)),
            cheap_threshold=_opt_float(conf.get(CONF_PRICE_CHEAP)),
            expensive_threshold=_opt_float(conf.get(CONF_PRICE_EXPENSIVE)),
            max_adjust=float(
                conf.get(CONF_PRICE_MAX_ADJUST, DEFAULT_PRICE_MAX_ADJUST)
            ),
            min_comfort=float(
                conf.get(CONF_PRICE_MIN_COMFORT, DEFAULT_PRICE_MIN_COMFORT)
            ),
        )

    @property
    def effective_target(self) -> float | None:
        """The setpoint the controller currently works towards."""
        data = self.data
        if data is None:
            return None
        return effective_target(
            self.zone_config, data.snapshot, data.decision.effective_mode
        )

    def heatpump_heating(self) -> bool:
        state = self._climate_state()
        if state is None:
            return False
        return state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN, "off")

    def tracked_entities(self) -> list[str]:
        conf = self.config_data
        entities: list[str] = []
        for key in (CONF_PRIMARY_CLIMATE, CONF_TEMPERATURE_SENSOR):
            if value := conf.get(key):
                entities.append(value)
        if value := conf.get(CONF_OUTSIDE_TEMPERATURE_SENSOR):
            entities.append(value)
        for key in (
            CONF_SUPPLEMENTARY_POWER_SENSOR,
            CONF_SUPPLEMENTARY_ENERGY_SENSOR,
            CONF_HEATPUMP_POWER_SENSOR,
            CONF_HEATPUMP_ENERGY_SENSOR,
            CONF_PRICE_SENSOR,
        ):
            if value := conf.get(key):
                entities.append(value)
        entities.extend(conf.get(CONF_SUPPLEMENTARY_SWITCHES) or [])
        entities.extend(conf.get(CONF_PRESENCE_ENTITIES) or [])
        return entities

    # ------------------------------------------------------------------
    # Setup / teardown
    # ------------------------------------------------------------------
    async def async_setup(self) -> None:
        """Load persisted state, reconcile with reality and start listening."""
        stored = await self._store.async_load()
        if stored:
            self._state = ZoneState.from_dict(stored.get("zone"))
            self._ledger = EnergyLedger.from_dict(stored.get("ledger"))
            self._baseline = BaselinePeriod.from_dict(stored.get("baseline"))
            self._schedule = WeeklySchedule.from_dict(stored.get("schedule"))
            self._vacation = Vacation.from_dict(stored.get("vacation"))
            self._temperatures = TemperatureLedger.from_dict(
                stored.get("temperatures")
            )
            self._radiator_counter = CounterTracker.from_dict(
                stored.get("counters", {}).get("radiator") or {},
                timedelta(hours=2),
            )
            self._heatpump_counter = CounterTracker.from_dict(
                stored.get("counters", {}).get("heatpump") or {},
                timedelta(hours=2),
            )
            self._radiator_integrator = PowerIntegrator.from_dict(
                stored.get("integrators", {}).get("radiator") or {},
                timedelta(minutes=15),
            )
            self._heatpump_integrator = PowerIntegrator.from_dict(
                stored.get("integrators", {}).get("heatpump") or {},
                timedelta(minutes=15),
            )
        self._loaded = True

        # Reconcile: adopt the real switch state instead of assuming ours.
        self._state.radiator_on = self._read_radiator_is_on()
        self._state.radiator_changed_at = None

        tracked = self.tracked_entities()
        if tracked:
            self._unsubscribers.append(
                async_track_state_change_event(
                    self.hass, tracked, self._handle_state_change
                )
            )
        self._unsubscribers.append(
            async_track_time_interval(self.hass, self._handle_tick, TICK)
        )

        await self.async_refresh()

    async def async_shutdown(self) -> None:
        for unsub in self._unsubscribers:
            unsub()
        self._unsubscribers.clear()
        await super().async_shutdown()

    @callback
    def _handle_state_change(self, event: Event[EventStateChangedData]) -> None:
        self.hass.async_create_task(self.async_refresh())

    async def _handle_tick(self, _now: datetime) -> None:
        await self.async_refresh()

    # ------------------------------------------------------------------
    # Main loop
    # ------------------------------------------------------------------
    async def _async_update_data(self) -> ZoneData:
        now = dt_util.now()
        snapshot = self._build_snapshot(now)
        # Adopt changes made at the switch itself, so the guards and the minimum
        # runtime bookkeeping act on the real device state instead of a stale
        # idea of it.
        self._adopt_radiator_state(snapshot, now)

        presence_raw = self._read_presence_raw()
        self._last_presence_raw = presence_raw
        conf = self.config_data

        confirmed = update_presence(
            self._state,
            presence_raw,
            now,
            timedelta(minutes=float(conf.get(CONF_ABSENCE_DELAY, 30))),
            timedelta(minutes=float(conf.get(CONF_ARRIVAL_CONFIRM, 0))),
            UnknownPresenceBehaviour(
                conf.get(CONF_UNKNOWN_BEHAVIOR, UnknownPresenceBehaviour.KEEP_LAST)
            ),
        )

        # Vacation overrides presence, but only while the zone is in Auto so a
        # deliberate manual mode is never silently undone.
        if (
            self._vacation.active(dt_util.as_local(now).date())
            and self._state.selected_mode is Mode.AUTO
        ):
            confirmed = Presence.AWAY

        self._schedule_target = resolve_schedule(self._schedule, now)
        self._price_decision = optimise_for_price(
            self._price_sensor_value(conf.get(CONF_PRICE_SENSOR)),
            self.price_settings,
            base_target=self._configured_base_target(confirmed, now),
            presence_home=confirmed is Presence.HOME,
        )

        snapshot = replace(
            snapshot,
            presence=confirmed,
            radiator_is_on=self._read_radiator_is_on(),
            schedule_target=self._schedule_target,
            price_offset=self._price_decision.offset,
        )

        decision, new_state = evaluate(self.zone_config, snapshot, self._state)
        self._state = new_state

        if not decision.dry_run:
            await self._apply(decision, snapshot)

        self._update_energy(now, snapshot)

        data = self._build_data(snapshot, decision, presence_raw, now)
        self._schedule_save()
        return data

    # ------------------------------------------------------------------
    # Snapshot helpers
    # ------------------------------------------------------------------
    def _configured_base_target(self, presence: Presence, now: datetime) -> float:
        """Base setpoint used to bound the price offset."""
        config = self.zone_config
        if presence is Presence.AWAY:
            return config.away_target
        if self._schedule_target is not None:
            return self._schedule_target
        return config.home_target

    def _build_snapshot(self, now: datetime) -> ZoneSnapshot:
        conf = self.config_data
        temperature, updated = self._read_temperature()
        offset = float(conf.get(CONF_TEMPERATURE_OFFSET, 0.0))
        if temperature is not None:
            temperature = round(temperature + offset, 2)

        heatpump_state = self._climate_state()
        heatpump_available = (
            heatpump_state is not None
            and heatpump_state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN)
        )

        return ZoneSnapshot(
            now=now,
            room_temperature=temperature,
            temperature_updated=updated,
            presence=self._state.confirmed_presence,
            heatpump_available=heatpump_available,
            heatpump_heating=self._heatpump_is_heating(),
            heatpump_cooling=(
                heatpump_state is not None
                and heatpump_state.state in COOLING_HVAC_MODES
            ),
            radiator_available=self._radiator_available(),
            radiator_is_on=self._read_radiator_is_on(),
            heatpump_target=(
                heatpump_state.attributes.get("temperature")
                if heatpump_state is not None
                else None
            ),
        )

    def _climate_state(self):
        entity_id = self.config_data.get(CONF_PRIMARY_CLIMATE)
        if not entity_id:
            return None
        return self.hass.states.get(entity_id)

    def _read_temperature(self) -> tuple[float | None, datetime | None]:
        conf = self.config_data
        sensor = conf.get(CONF_TEMPERATURE_SENSOR)
        if sensor:
            state = self.hass.states.get(sensor)
            if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                return None, None
            try:
                return float(state.state), state.last_updated
            except (TypeError, ValueError):
                return None, None

        climate_state = self._climate_state()
        if climate_state is None:
            return None, None
        current = climate_state.attributes.get("current_temperature")
        if current is None:
            return None, None
        try:
            return float(current), climate_state.last_updated
        except (TypeError, ValueError):
            return None, None

    def _read_presence_raw(self) -> Presence:
        entities = self.config_data.get(CONF_PRESENCE_ENTITIES) or []
        if not entities:
            # No presence source configured: treat the zone as occupied so the
            # controller never sits in Away by accident.
            return Presence.HOME

        home = False
        away = False
        unknown = False
        for entity_id in entities:
            state = self.hass.states.get(entity_id)
            if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                unknown = True
                continue
            if state.state in HOME_STATES:
                home = True
            elif state.state in ("not_home", "off"):
                away = True
            else:
                unknown = True

        if home:
            return Presence.HOME
        if away and not unknown:
            return Presence.AWAY
        if away and unknown:
            # A mix of away and unknown must not immediately mean Away.
            return Presence.UNKNOWN
        return Presence.UNKNOWN

    def _radiator_available(self) -> bool:
        switches = self.config_data.get(CONF_SUPPLEMENTARY_SWITCHES) or []
        if not switches:
            return False
        for entity_id in switches:
            state = self.hass.states.get(entity_id)
            if state is None or state.state == STATE_UNAVAILABLE:
                return False
        return True

    def _read_radiator_is_on(self) -> bool:
        switches = self.config_data.get(CONF_SUPPLEMENTARY_SWITCHES) or []
        return any(
            (state := self.hass.states.get(entity_id)) is not None
            and state.state == STATE_ON
            for entity_id in switches
        )

    def _adopt_radiator_state(self, snapshot: ZoneSnapshot, now: datetime) -> None:
        """Take over a radiator change made outside the controller.

        Without this, a switch flipped by hand leaves the persisted state out of
        date, and every decision is compared against a state the device is not
        in: the controller would neither correct it nor track its runtime.
        """
        if not snapshot.radiator_available:
            return
        if snapshot.radiator_is_on == self._state.radiator_on:
            return
        if (
            self._last_radiator_command_at is not None
            and now - self._last_radiator_command_at < COMMAND_SETTLE
        ):
            # Give the device a moment to report the state we just commanded.
            return
        self._state.radiator_on = snapshot.radiator_is_on
        self._state.radiator_changed_at = now
        # A plug switched on by hand is a person asking for heat right now.
        self._state.radiator_manual = snapshot.radiator_is_on

    def _heatpump_is_heating(self) -> bool:
        """True when the heat pump is set up to actually deliver heat."""
        entity_id = self.config_data.get(CONF_PRIMARY_CLIMATE)
        if not entity_id:
            return True
        state = self.hass.states.get(entity_id)
        if state is None:
            # Not ready yet; assume it is heating rather than blindly backing up.
            return True
        return state.state in HEATING_HVAC_MODES

    # ------------------------------------------------------------------
    # Applying decisions
    # ------------------------------------------------------------------
    async def _apply(self, decision: Decision, snapshot: ZoneSnapshot) -> None:
        if self._applying:
            return
        self._applying = True
        try:
            await self._apply_heatpump(decision, snapshot)
            await self._apply_radiator(decision, snapshot)
        finally:
            self._applying = False

    async def _apply_heatpump(
        self, decision: Decision, snapshot: ZoneSnapshot
    ) -> None:
        entity_id = self.config_data.get(CONF_PRIMARY_CLIMATE)
        if not entity_id or decision.heatpump_target is None:
            return
        if not snapshot.heatpump_available:
            return

        current = snapshot.heatpump_target
        if current is not None and abs(float(current) - decision.heatpump_target) < 0.1:
            return

        _LOGGER.debug(
            "%s: setting heat pump %s to %.1f (dry_run=%s)",
            self.zone_name,
            entity_id,
            decision.heatpump_target,
            decision.dry_run,
        )
        try:
            await self.hass.services.async_call(
                "climate",
                "set_temperature",
                {"entity_id": entity_id, "temperature": decision.heatpump_target},
                blocking=False,
            )
        except HomeAssistantError as err:
            _LOGGER.warning(
                "%s: could not set heat pump target: %s", self.zone_name, err
            )

    async def _apply_radiator(self, decision: Decision, snapshot: ZoneSnapshot) -> None:
        if decision.radiator_on is None:
            return
        switches = self.config_data.get(CONF_SUPPLEMENTARY_SWITCHES) or []
        if not switches or not snapshot.radiator_available:
            return

        service = "turn_on" if decision.radiator_on else "turn_off"
        targets = [
            entity_id
            for entity_id in switches
            if (state := self.hass.states.get(entity_id)) is not None
            and (state.state == STATE_ON) != decision.radiator_on
        ]
        if not targets:
            self._state.radiator_on = decision.radiator_on
            return

        _LOGGER.debug(
            "%s: %s radiator %s (reason=%s)",
            self.zone_name,
            service,
            targets,
            decision.reason,
        )
        try:
            await self.hass.services.async_call(
                "switch",
                service,
                {"entity_id": targets},
                blocking=False,
            )
        except HomeAssistantError as err:
            _LOGGER.warning(
                "%s: could not switch radiator: %s", self.zone_name, err
            )
            return
        self._last_radiator_command_at = snapshot.now
        if decision.radiator_on != self._state.radiator_on:
            self._state.radiator_on = decision.radiator_on
            self._state.radiator_changed_at = snapshot.now

    # ------------------------------------------------------------------
    # Energy accounting
    # ------------------------------------------------------------------
    def _update_energy(self, now: datetime, snapshot: ZoneSnapshot) -> None:
        today = dt_util.as_local(now).date()
        conf = self.config_data

        self._track_energy_source(
            SOURCE_RADIATOR,
            self.config_data.get(CONF_SUPPLEMENTARY_ENERGY_SENSOR),
            self.config_data.get(CONF_SUPPLEMENTARY_POWER_SENSOR),
            self._radiator_counter,
            self._radiator_integrator,
            today,
            now,
        )
        self._track_energy_source(
            SOURCE_HEATPUMP,
            self.config_data.get(CONF_HEATPUMP_ENERGY_SENSOR),
            self.config_data.get(CONF_HEATPUMP_POWER_SENSOR),
            self._heatpump_counter,
            self._heatpump_integrator,
            today,
            now,
        )
        self._ledger.prune(today, LEDGER_RETENTION_DAYS)

        outside = self._read_float(conf.get(CONF_OUTSIDE_TEMPERATURE_SENSOR))
        if outside is not None:
            self._temperatures.add(today, outside)
        self._temperatures.prune(today, LEDGER_RETENTION_DAYS)

    def _track_energy_source(
        self,
        source: str,
        energy_entity: str | None,
        power_entity: str | None,
        counter: CounterTracker,
        integrator: PowerIntegrator,
        today: date,
        now: datetime,
    ) -> None:
        if energy_entity:
            state = self.hass.states.get(energy_entity)
            value: float | None = None
            if state is not None and state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                try:
                    value = to_kwh(
                        float(state.state),
                        state.attributes.get(ATTR_UNIT_OF_MEASUREMENT),
                    )
                except (TypeError, ValueError):
                    value = None
            update = counter.update(now, value)
            if update.delta_kwh is not None:
                self._ledger.add(source, today, update.delta_kwh, gap=False)
            elif update.gap:
                self._ledger.add(source, today, 0.0, gap=True)
            return

        if power_entity:
            state = self.hass.states.get(power_entity)
            watts: float | None = None
            if state is not None and state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                try:
                    watts = float(state.state)
                    if state.attributes.get(ATTR_UNIT_OF_MEASUREMENT) == "kW":
                        watts *= 1000.0
                except (TypeError, ValueError):
                    watts = None
            kwh, gap = integrator.update(now, watts)
            if kwh or gap:
                self._ledger.add(source, today, kwh, gap=gap)

    def _source_snapshot(
        self,
        source: str,
        power_entity: str | None,
        energy_entity: str | None,
        today: date,
        *,
        actuator_available: bool = True,
    ) -> SourceSnapshot:
        power: float | None = None
        if power_entity:
            state = self.hass.states.get(power_entity)
            if state is not None and state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                try:
                    power = float(state.state)
                    if state.attributes.get(ATTR_UNIT_OF_MEASUREMENT) == "kW":
                        power *= 1000.0
                except (TypeError, ValueError):
                    power = None

        bucket = self._ledger.bucket(source, today)
        available = bool(energy_entity or power_entity) and actuator_available
        if energy_entity:
            quality = QUALITY_MEASURED
        elif power_entity:
            quality = QUALITY_ESTIMATED
        else:
            quality = QUALITY_MISSING

        return SourceSnapshot(
            power_w=power,
            kwh_today=bucket.kwh if bucket else None,
            quality=quality,
            available=available,
        )

    # ------------------------------------------------------------------
    # Building the published data object
    # ------------------------------------------------------------------
    def _build_data(
        self,
        snapshot: ZoneSnapshot,
        decision: Decision,
        presence_raw: Presence,
        now: datetime,
    ) -> ZoneData:
        conf = self.config_data
        today = dt_util.as_local(now).date()

        radiator_snapshot = self._source_snapshot(
            SOURCE_RADIATOR,
            conf.get(CONF_SUPPLEMENTARY_POWER_SENSOR),
            conf.get(CONF_SUPPLEMENTARY_ENERGY_SENSOR),
            today,
            actuator_available=self._radiator_available(),
        )
        climate_state = self._climate_state()
        heatpump_snapshot = self._source_snapshot(
            SOURCE_HEATPUMP,
            conf.get(CONF_HEATPUMP_POWER_SENSOR),
            conf.get(CONF_HEATPUMP_ENERGY_SENSOR),
            today,
            actuator_available=(
                climate_state is not None
                and climate_state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN)
            )
            if conf.get(CONF_PRIMARY_CLIMATE)
            else True,
        )

        price = resolve_price(
            sensor_price=self._price_sensor_value(conf.get(CONF_PRICE_SENSOR)),
            all_in_price=_opt_float(conf.get(CONF_ALL_IN_PRICE)),
            # Stored in öre/kWh because that is how Swedish invoices list it.
            surcharge=(_opt_float(conf.get(CONF_PRICE_SURCHARGE)) or 0.0) / 100.0,
        )

        periods = {
            "today": period_today(today),
            "week": period_week(today),
            "month": period_month(today),
        }

        totals: dict[str, dict[str, EnergyTotal]] = {}
        costs: dict[str, dict[str, float | None]] = {}
        for name, (start, end) in periods.items():
            totals[name] = {
                SOURCE_RADIATOR: self._ledger.total(SOURCE_RADIATOR, start, end),
                SOURCE_HEATPUMP: self._ledger.total(
                    SOURCE_HEATPUMP, start, end, quality=QUALITY_ESTIMATED
                    if conf.get(CONF_HEATPUMP_ENERGY_SENSOR) is None
                    else QUALITY_MEASURED
                ),
                SOURCE_TOTAL: self._ledger.combined_total(start, end),
            }
            costs[name] = {
                source: estimate_cost(total.kwh, price)
                for source, total in totals[name].items()
            }

        heatpump_measured = bool(conf.get(CONF_HEATPUMP_ENERGY_SENSOR))
        savings = compare(
            self._ledger,
            self._baseline,
            today,
            source=SOURCE_TOTAL,
            heatpump_measured=heatpump_measured,
            temperatures=self._temperatures,
        )

        return ZoneData(
            snapshot=snapshot,
            decision=decision,
            presence_raw=presence_raw,
            radiator=radiator_snapshot,
            heatpump=heatpump_snapshot,
            totals=totals,
            costs=costs,
            price=price,
            savings=savings,
            savings_warning=radiator_savings_only(heatpump_measured),
            outside_temperature=self._read_float(
                conf.get(CONF_OUTSIDE_TEMPERATURE_SENSOR)
            ),
            schedule_target=self._schedule_target,
            price_decision=self._price_decision,
            last_updated=now,
        )

    def _read_float(self, entity_id: str | None) -> float | None:
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        try:
            return float(state.state)
        except (TypeError, ValueError):
            return None

    def _price_sensor_value(self, entity_id: str | None) -> float | None:
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        try:
            return float(state.state)
        except (TypeError, ValueError):
            return None

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def _data_to_save(self) -> dict[str, Any]:
        return {
            "zone": self._state.as_dict(),
            "ledger": self._ledger.as_dict(),
            "baseline": self._baseline.as_dict(),
            "schedule": self._schedule.as_dict(),
            "vacation": self._vacation.as_dict(),
            "temperatures": self._temperatures.as_dict(),
            "counters": {
                "radiator": self._radiator_counter.as_dict(),
                "heatpump": self._heatpump_counter.as_dict(),
            },
            "integrators": {
                "radiator": self._radiator_integrator.as_dict(),
                "heatpump": self._heatpump_integrator.as_dict(),
            },
        }

    @callback
    def _schedule_save(self) -> None:
        self._store.async_delay_save(self._data_to_save, 10)

    async def async_flush(self) -> None:
        """Write state immediately (used on unload and before export)."""
        await self._store.async_save(self._data_to_save())

    # ------------------------------------------------------------------
    # User actions
    # ------------------------------------------------------------------
    async def async_set_mode(self, mode: Mode, duration: timedelta | None = None) -> None:
        now = dt_util.now()
        if mode is Mode.BOOST:
            self._state.selected_mode = Mode.BOOST
            self._state.boost_until = now + (duration or self.boost_duration)
        else:
            self._state.boost_until = None
            if duration is not None:
                self._state.override_previous_mode = self._state.selected_mode
                self._state.override_until = now + duration
            else:
                self._state.override_previous_mode = None
                self._state.override_until = None
            self._state.selected_mode = mode
        await self.async_refresh()

    async def async_set_schedule(self, schedule: WeeklySchedule) -> None:
        """Persist a new weekly schedule (used by the settings UI)."""
        self._schedule = schedule
        await self.async_flush()
        await self.async_refresh()

    async def async_set_vacation(self, vacation: Vacation) -> None:
        """Persist a vacation range (used by the settings UI)."""
        self._vacation = vacation
        await self.async_flush()
        await self.async_refresh()

    async def async_start_baseline(self) -> None:
        today = dt_util.now().date()
        self._baseline = BaselinePeriod(start=today, end=None)
        await self.async_flush()
        await self.async_refresh()

    async def async_stop_baseline(self) -> None:
        today = dt_util.now().date()
        self._baseline = BaselinePeriod(start=self._baseline.start, end=today)
        await self.async_flush()
        await self.async_refresh()

    async def async_set_number(self, key: str, value: float) -> None:
        """Persist a numeric setting without reloading the integration."""
        await self.async_set_option(key, value)

    async def async_set_option(self, key: str, value: Any) -> None:
        """Persist any single option without reloading the integration."""
        options = dict(self.entry.options)
        options[key] = value
        self.hass.config_entries.async_update_entry(self.entry, options=options)
        await self.async_refresh()

    async def async_set_options(self, updates: dict[str, Any]) -> None:
        """Persist several options at once (one entry update, one refresh)."""
        options = dict(self.entry.options)
        options.update(updates)
        self.hass.config_entries.async_update_entry(self.entry, options=options)
        await self.async_refresh()

    def export_csv(self) -> str:
        """Return a CSV of daily aggregates (one row per day and source)."""
        lines = ["date,source,kwh,complete,samples,gaps"]
        dates: set[date] = set()
        for source_buckets in self._ledger.buckets.values():
            for key in source_buckets:
                dates.add(date.fromisoformat(key))
        for day in sorted(dates):
            for source in (SOURCE_RADIATOR, SOURCE_HEATPUMP):
                bucket = self._ledger.bucket(source, day)
                if bucket is None:
                    continue
                lines.append(
                    f"{day.isoformat()},{source},{bucket.kwh:.3f},"
                    f"{str(bucket.complete).lower()},{bucket.samples},{bucket.gaps}"
                )
        return "\n".join(lines) + "\n"


def _opt_float(value: object) -> float | None:
    if value is None:
        return None
    try:
        return float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
