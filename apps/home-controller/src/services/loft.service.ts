import { ControllerSettings, RoomController } from '@automagical/contracts';
import { LightStateDTO } from '@automagical/contracts/home-assistant';
import { LightingControllerService } from '@automagical/custom';
import {
  EntityManagerService,
  EntityService,
  FanDomainService,
  RemoteDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { Debug, InjectLogger, sleep, Trace } from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';

import { GLOBAL_TRANSITION, ROOM_NAMES } from '../typings';

const monitor = 'media_player.monitor';
const PANEL_LIGHTS = ['light.loft_wall_bottom', 'light.loft_wall_top'];
const FAN_LIGHTS = [
  'light.loft_fan_bench_right',
  'light.loft_fan_desk_right',
  'light.loft_fan_desk_left',
  'light.loft_fan_bench_left',
];
const EVENING_BRIGHTNESS = 40;

/**
 * If in auto mode:
 *
 * - During the day all lights are on
 * - 4PM light panel slowly turns off
 * - ~5PM fan dims
 * - 6PM hall light turns off
 * - 11PM desk light turns off
 *
 * Caching needs to be provided by something off-process to persist properly to make auto mode work
 * during development.
 */
@Injectable()
export class LoftService extends EntityService implements RoomController {
  // #region Object Properties

  public name = ROOM_NAMES.loft;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger()
    protected readonly logger: PinoLogger,
    private readonly lightingController: LightingControllerService,
    private readonly entityManager: EntityManagerService,
    private readonly remoteService: RemoteDomainService,
    private readonly eventEmitter: EventEmitter2,
    private readonly switchService: SwitchDomainService,
    private readonly fanService: FanDomainService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Private Accessors

  private get AUTO_MODE(): Promise<boolean> {
    return this.cacheManager.get(`LOFT_AUTO_MODE`);
  }

  // #endregion Private Accessors

  // #region Public Methods

  @Trace()
  public async areaOff(count: number): Promise<boolean> {
    await this.cacheManager.del(`LOFT_AUTO_MODE`);
    if (count === 2) {
      await this.remoteService.turnOff(monitor);
      this.eventEmitter.emit(GLOBAL_TRANSITION);
    }
    if (count === 3) {
      await this.fanService.turnOff('fan.loft_ceiling_fan');
    }
    return true;
  }

  @Trace()
  public async areaOn(): Promise<boolean> {
    await this.cacheManager.del(`LOFT_AUTO_MODE`);
    return true;
  }

  @Trace()
  public async combo(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async dimDown(): Promise<boolean> {
    await this.cacheManager.del(`LOFT_AUTO_MODE`);
    return true;
  }

  @Trace()
  public async dimUp(): Promise<boolean> {
    await this.cacheManager.del(`LOFT_AUTO_MODE`);
    return true;
  }

  @Trace()
  public async favorite(count: number): Promise<boolean> {
    await this.cacheManager.set(`LOFT_AUTO_MODE`, true, {
      ttl: 60 * 60 * 24,
    });
    if (count === 1) {
      await this.remoteService.turnOn(monitor);
    }
    const hour = dayjs().hour();
    if (count === 1) {
      // Set fan
      await this.lightingController.circadianLight(
        FAN_LIGHTS,
        this.fanAutoBrightness(),
      );
      // Set panel
      const panelBrightness = this.panelAutoBrightness();
      await (panelBrightness === 0
        ? this.lightingController.turnOff(PANEL_LIGHTS)
        : this.lightingController.circadianLight(
            PANEL_LIGHTS,
            panelBrightness,
          ));
      // Set desk light
      await (hour === 23
        ? this.switchService.turnOff(['switch.desk_light'])
        : this.switchService.turnOn(['switch.desk_light']));
      // Turn off stair light
      await this.switchService.turnOff(['switch.stair_lights']);
      // Hallway light during the day
      await (hour > 8 && hour < 17
        ? this.switchService.turnOn(['switch.loft_hallway_light'])
        : this.switchService.turnOff(['switch.loft_hallway_light']));
      return false;
    }
    if (count === 2) {
      this.lightingController.roomOff(ROOM_NAMES.master);
      this.lightingController.roomOff(ROOM_NAMES.downstairs);
      this.lightingController.roomOff(ROOM_NAMES.games);
    }
    return false;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Cron('0 45 22 * * *')
  @Debug(`Wind Down`)
  protected async windDown(): Promise<void> {
    if (!(await this.AUTO_MODE)) {
      return;
    }
    this.switchService.turnOff(['switch.desk_light']);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  @Trace()
  protected async fanLightSchedule(): Promise<void> {
    if (!(await this.AUTO_MODE)) {
      return;
    }
    const brightness = this.fanAutoBrightness();
    if (brightness === 0) {
      await this.lightingController.turnOff(PANEL_LIGHTS);
      return;
    }
    if (this.lightingController.getBrightness(FAN_LIGHTS[0]) === brightness) {
      return;
    }
    await this.lightingController.circadianLight(FAN_LIGHTS, brightness);
  }

  @Cron('0 0 22 * * *')
  @Trace()
  protected async lightOff(): Promise<void> {
    await this.switchService.turnOff('switch.back_desk_light');
  }

  @Cron('0 0 7 * * *')
  @Trace()
  protected async lightOn(): Promise<void> {
    await this.switchService.turnOn('switch.back_desk_light');
  }

  /**
   * 4PM AUTO: Dim panel slowly
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  @Trace()
  protected async panelSchedule(): Promise<void> {
    if (!(await this.AUTO_MODE)) {
      return;
    }
    const brightness = this.panelAutoBrightness();
    const [light] = this.entityManager.getEntity<LightStateDTO>(PANEL_LIGHTS);
    if (brightness === 0) {
      if (light.state === 'on') {
        await this.lightingController.turnOff(PANEL_LIGHTS);
        // Sometimes one gets stuck
        await sleep(2000);
        await this.lightingController.turnOff(PANEL_LIGHTS);
      }
      return;
    }
    if (light.attributes.brightness === brightness) {
      return;
    }
    await this.lightingController.circadianLight(PANEL_LIGHTS, brightness);
  }

  @Trace()
  protected async onModuleInit(): Promise<void> {
    this.lightingController.setRoomController('sensor.loft_pico', this, {
      devices: [
        {
          comboCount: 1,
          target: [...PANEL_LIGHTS, ...FAN_LIGHTS, 'switch.desk_light'],
        },
        {
          comboCount: 2,
          target: ['switch.loft_hallway_light', 'switch.stair_light'],
        },
        {
          comboCount: 3,
          rooms: [
            ROOM_NAMES.downstairs,
            { name: ROOM_NAMES.master, type: 'off' },
            { name: ROOM_NAMES.games, type: 'off' },
          ],
        },
      ],
    });
    this.trackEntity(monitor);
    const LOFT_AUTO_MODE = await this.cacheManager.get(`LOFT_AUTO_MODE`);
    this.logger.debug({ LOFT_AUTO_MODE }, 'LOFT_AUTO_MODE');
  }

  // #endregion Protected Methods

  // #region Private Methods

  /**
   * Return what the brightness should be for the fan lights in auto mode
   */
  private fanAutoBrightness(): number {
    const now = dayjs();
    const hour = now.hour();
    const minute = now.minute();
    const second = now.second();
    // If before 6AM, 5% (min brightness)
    if (hour < 7) {
      return 5;
    }
    // Partial wakeup @ 7AM
    if (hour === 7) {
      const brightness = 5 + this.ticksThisHour(minute, second);
      return brightness > 75 ? 75 : brightness;
    }
    // Finish wakeup @ 9AM
    if (hour === 9) {
      const brightness = 75 + minute;
      return brightness > 100 ? 100 : brightness;
    }
    // Stay on all day until 6PM
    if (hour < 18) {
      return 100;
    }
    // Start winding down
    if (hour === 18) {
      const brightness = 100 - this.ticksThisHour(minute, second);
      return brightness < EVENING_BRIGHTNESS ? EVENING_BRIGHTNESS : brightness;
    }
    if (hour < 23) {
      return EVENING_BRIGHTNESS;
    }
    const brightness = EVENING_BRIGHTNESS - this.ticksThisHour(minute, second);
    return brightness < 5 ? 5 : brightness;
  }

  /**
   * Return what the brightness should be for the panel in auto mode
   */
  private panelAutoBrightness(): number {
    const now = dayjs();
    const hour = now.hour();
    const minute = now.minute();
    const second = now.second();
    // If before 6AM, stay off
    if (hour < 7) {
      return 0;
    }
    // Partial wakeup @ 7AM
    if (hour === 7) {
      const brightness = this.ticksThisHour(minute, second);
      return brightness > 75 ? 75 : brightness;
    }
    // Finish wakeup @ 9AM
    if (hour === 9) {
      const brightness = 75 + this.ticksThisHour(minute, second);
      return brightness > 100 ? 100 : brightness;
    }
    // Stay on all day until 4PM
    if (hour < 16) {
      return 100;
    }
    // Start winding down
    if (hour === 16) {
      if (minute < 10) {
        return;
      }
      const brightness = 120 - this.ticksThisHour(minute, second);
      this.logger.debug(
        { brightness },
        `panelAutoBrightness wind down ${dayjs().format('HH:mm:ss')}`,
      );
      return brightness < 0 ? 0 : brightness;
    }
    return 0;
  }

  /**
   * Increase by 1 every 30 seconds
   */
  private ticksThisHour(minute: number, second: number): number {
    return minute * 2 + (second >= 30 ? 1 : 0);
  }

  // #endregion Private Methods
}
