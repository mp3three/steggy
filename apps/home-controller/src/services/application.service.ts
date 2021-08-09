import { iRoomController } from '@automagical/contracts';
import {
  HA_EVENT_STATE_CHANGE,
  HA_SOCKET_READY,
  METADATA_CACHE_KEY,
} from '@automagical/contracts/constants';
import {
  BatteryStateDTO,
  domain,
  HASS_DOMAINS,
} from '@automagical/contracts/home-assistant';
import { SET_ROOM_STATE } from '@automagical/contracts/utilities';
import { RelayService } from '@automagical/controller-logic';
import {
  EntityManagerService,
  LockDomainService,
  NotifyDomainService,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  Debug,
  InjectCache,
  OnMQTT,
  Payload,
  SolarCalcService,
  Trace,
  Warn,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';
import {
  GLOBAL_TRANSITION,
  HOMEASSISTANT_LEAVE_HOME,
  HOMEASSISTANT_MOBILE_LOCK,
  HOMEASSISTANT_MOBILE_UNLOCK,
  ROOM_FAVORITE,
  ROOM_NAMES,
} from '../typings';

@Injectable()
export class ApplicationService {
  // #region Object Properties

  private connectionReady = false;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    protected readonly logger: AutoLogService,
    @InjectCache() private readonly cache: CacheManagerService,
    private readonly solarCalc: SolarCalcService,
    private readonly notifyService: NotifyDomainService,
    private readonly entityManager: EntityManagerService,
    private readonly lockService: LockDomainService,
    private readonly eventEmitterService: EventEmitter2,
    private readonly relayService: RelayService,
  ) {}

  // #endregion Constructors

  // #region Public Accessors

  public get locks(): string[] {
    return this.entityManager.listEntities().filter((id) => {
      return domain(id) === HASS_DOMAINS.lock && id.includes('door');
    });
  }

  // #endregion Public Accessors

  // #region Public Methods

  @OnMQTT(HOMEASSISTANT_MOBILE_LOCK)
  @OnEvent(GLOBAL_TRANSITION)
  @Warn('Lock Doors')
  public async lockDoors(): Promise<void> {
    await this.lockService.lock(this.locks);
  }

  @OnMQTT(HOMEASSISTANT_MOBILE_UNLOCK)
  @Warn('Unlock Doors')
  public async unlockDoors(): Promise<void> {
    await this.lockService.unlock(this.locks);
  }

  public onModuleInit(): void {
    setTimeout(async () => {
      // debugger;
      // this.eventEmitterService.emit(ROOM_FAVORITE(ROOM_NAMES.games));
      // await this.lockDoors();
    }, 1000);
  }

  // #endregion Public Methods

  // #region Protected Methods

  /**
   * Hey! Parts of the house need batteries swapped out
   *
   * Maybe add it as a weekend item
   */
  @Cron('0 0 11 * * Sat')
  @Debug('Battery monitor')
  protected async batteryMonitor(): Promise<void> {
    const entities = this.entityManager.listEntities().filter((id) => {
      return (
        domain(id) === HASS_DOMAINS.sensor &&
        ['door', 'switch'].some((item) => id.includes(item)) &&
        id.includes('battery')
      );
    });
    this.entityManager
      .getEntity<BatteryStateDTO>(entities)
      .forEach((entity) => {
        const pct = Number(entity.state);
        if (pct < 10) {
          this.notifyService.notify(
            `${entity.attributes.friendly_name} is at ${entity.state}%`,
          );
        }
      });
  }

  /**
   * What time is the big light bulb in the sky going away?
   */
  @Cron('0 0 11 * * *')
  @Debug('Sending day info')
  protected async dayInfo(): Promise<void> {
    const { SOLAR_CALC } = this.solarCalc;
    const start = dayjs(SOLAR_CALC.goldenHourStart).format('hh:mm');
    const end = dayjs(SOLAR_CALC.goldenHourEnd).format('hh:mm');
    const dusk = dayjs(SOLAR_CALC.dusk).format('hh:mm');
    const message = [
      dayjs().format('ddd MMM DD'),
      `🌄 Golen Hour: ${start} - ${end}`,
      `🌃 Dusk: ${dusk}`,
    ].join(`\n`);
    await this.notifyService.notify(`${message}\n${message}`);
  }

  @OnEvent(HA_EVENT_STATE_CHANGE)
  @Trace()
  protected async eventStats(): Promise<void> {
    const key = METADATA_CACHE_KEY('HASS_EVENT_COUNT');
    const value = (await this.cache.get<number>(key)) ?? 0;
    await this.cache.set(key, value);
  }

  @OnEvent(HA_SOCKET_READY)
  @Trace()
  protected async onSocketReset(): Promise<void> {
    if (!this.connectionReady) {
      this.connectionReady = true;
      return;
    }
    await this.notifyService.notify(
      `Connection reset at ${new Date().toISOString()}`,
      {
        title: `Temporarily lost connection with Home Assistant`,
      },
    );
  }

  @OnMQTT(SET_ROOM_STATE)
  protected async setRoomState(
    @Payload() [room, state]: [ROOM_NAMES, keyof iRoomController],
  ): Promise<void> {
    switch (state) {
      case 'areaOff':
        await this.relayService.turnOff([room]);
        return;
      case 'areaOn':
        await this.relayService.turnOn([room]);
        return;
      case 'dimUp':
        await this.relayService.dimUp([room]);
        return;
      case 'dimDown':
        await this.relayService.dimDown([room]);
        return;
      case 'favorite':
        this.eventEmitterService.emit(ROOM_FAVORITE(room));
        return;
    }
  }

  /**
   * Home Assistant relayed this request via a mobile app action
   *
   * Intended to lock up, turn off the lights, and send back verification
   */
  @OnMQTT(HOMEASSISTANT_LEAVE_HOME)
  @Debug('Home Assistant => Leave Home')
  protected async leaveHome(): Promise<void> {
    await this.lockDoors();
    await this.relayService.turnOff([
      ROOM_NAMES.master,
      ROOM_NAMES.loft,
      ROOM_NAMES.downstairs,
      ROOM_NAMES.guest,
    ]);
  }

  // #endregion Protected Methods
}
