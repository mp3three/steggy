import { iRoomController } from '@automagical/contracts';
import { LightStateDTO } from '@automagical/contracts/home-assistant';
import {
  LightingControllerService,
  LightManagerService,
  RelayService,
  RoomController,
  StateManager,
  StateManagerService,
} from '@automagical/controller-logic';
import {
  EntityManagerService,
  FanDomainService,
  MediaPlayerDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  Debug,
  InjectLogger,
  Trace,
} from '@automagical/utilities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';

import { GLOBAL_TRANSITION, ROOM_NAMES } from '../typings';

const MONITOR = 'media_player.monitor';
const PANEL_LIGHTS = ['light.loft_wall_bottom', 'light.loft_wall_top'];
const FAN_LIGHTS = [
  'light.loft_fan_bench_right',
  'light.loft_fan_desk_right',
  'light.loft_fan_desk_left',
  'light.loft_fan_bench_left',
];
const EVENING_BRIGHTNESS = 40;
const AUTO_STATE = 'AUTO_STATE';

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
@RoomController({
  accessories: ['switch.loft_hallway_light'],
  friendlyName: 'Loft',
  lights: [...PANEL_LIGHTS, ...FAN_LIGHTS],
  name: 'loft',
  remote: 'sensor.loft_pico',
  switches: ['switch.desk_light', 'sensor.loft_pico'],
})
export class LoftController implements Partial<iRoomController> {
  // #region Object Properties

  @StateManager()
  private readonly stateManager: StateManagerService;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger()
    protected readonly logger: AutoLogService,
    private readonly lightingController: LightingControllerService,
    private readonly entityManager: EntityManagerService,
    private readonly remoteService: MediaPlayerDomainService,
    private readonly eventEmitter: EventEmitter2,
    private readonly switchService: SwitchDomainService,
    private readonly fanService: FanDomainService,
    private readonly lightManager: LightManagerService,
    private readonly relayService: RelayService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(count: number): Promise<boolean> {
    this.logger.info({ count });
    await this.stateManager.removeFlag(AUTO_STATE);
    if (count === 2) {
      await this.remoteService.turnOff(MONITOR);
      this.eventEmitter.emit(GLOBAL_TRANSITION);
    }
    if (count === 3) {
      await this.remoteService.turnOff(MONITOR);
      await this.fanService.turnOff('fan.loft_ceiling_fan');
    }
    return true;
  }

  @Trace()
  public async areaOn(): Promise<void> {
    await this.stateManager.removeFlag(AUTO_STATE);
  }

  @Trace()
  public async favorite(count: number): Promise<boolean> {
    await this.stateManager.addFlag(AUTO_STATE);
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
        ? this.lightManager.turnOff(PANEL_LIGHTS)
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
      await (hour < 17
        ? this.switchService.turnOn(['switch.loft_hallway_light'])
        : this.switchService.turnOff(['switch.loft_hallway_light']));
      return false;
    }
    if (count === 2) {
      await this.remoteService.turnOn(MONITOR);
      await this.relayService.turnOff([
        ROOM_NAMES.master,
        ROOM_NAMES.downstairs,
        ROOM_NAMES.games,
      ]);
    }
    return false;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Cron(CronExpression.EVERY_30_SECONDS)
  protected async fanLightSchedule(): Promise<void> {
    const exists = await this.stateManager.hasFlag(AUTO_STATE);
    if (!exists) {
      return;
    }
    const target = this.fanAutoBrightness();
    if (target === 0) {
      await this.lightManager.turnOff(FAN_LIGHTS);
      return;
    }
    await this.lightingController.circadianLight(FAN_LIGHTS, target);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  protected async panelSchedule(): Promise<void> {
    if (!(await this.stateManager.hasFlag(AUTO_STATE))) {
      return;
    }
    const brightness = this.panelAutoBrightness();
    const [light] = this.entityManager.getEntity<LightStateDTO>(PANEL_LIGHTS);
    if (brightness === 0) {
      await this.lightManager.turnOff(PANEL_LIGHTS);
      return;
    }
    if (light.attributes.brightness === brightness) {
      return;
    }
    await this.lightingController.circadianLight(PANEL_LIGHTS, brightness);
  }

  @Cron('0 0 22 * * *')
  @Debug('Back desk light off')
  protected async lightOff(): Promise<void> {
    await this.switchService.turnOff('switch.back_desk_light');
  }

  @Cron('0 0 7 * * *')
  @Debug('Back desk light on')
  protected async lightOn(): Promise<void> {
    await this.switchService.turnOn('switch.back_desk_light');
  }

  @Cron('0 45 22 * * *')
  @Debug(`Wind Down`)
  protected async windDown(): Promise<void> {
    if (!(await this.stateManager.hasFlag(AUTO_STATE))) {
      return;
    }
    this.switchService.turnOff(['switch.desk_light']);
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
