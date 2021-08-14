import { ROOM_COMMAND } from '@automagical/contracts/controller-logic';
import {
  BatteryStateDTO,
  domain,
  HA_SOCKET_READY,
  HASS_DOMAINS,
} from '@automagical/contracts/home-assistant';
import {
  EntityManagerService,
  LockDomainService,
  NotifyDomainService,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  Cron,
  Debug,
  InjectCache,
  MqttService,
  OnEvent,
  OnMQTT,
  SolarCalcService,
  Trace,
  Warn,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { EventEmitter2 } from 'eventemitter2';

import {
  GLOBAL_TRANSITION,
  HOMEASSISTANT_LEAVE_HOME,
  HOMEASSISTANT_MOBILE_LOCK,
  HOMEASSISTANT_MOBILE_UNLOCK,
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
    private readonly mqtt: MqttService,
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
    // setInterval(() => {
    //   this.mqtt.publish(
    //     SEND_ROOM_STATE('loft', 'areaOn'),
    //     JSON.stringify({ count: 2 } as RoomControllerParametersDTO),
    //   );
    // }, 1000);
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

  /**
   * Home Assistant relayed this request via a mobile app action
   *
   * Intended to lock up, turn off the lights, and send back verification
   */
  @OnMQTT(HOMEASSISTANT_LEAVE_HOME)
  @Debug('Home Assistant => Leave Home')
  protected async leaveHome(): Promise<void> {
    await this.lockDoors();
    ['master', 'loft', 'downstairs', 'guest'].forEach((room) =>
      this.eventEmitterService.emit(ROOM_COMMAND(room, 'areaOff')),
    );
  }

  // #endregion Protected Methods
}
