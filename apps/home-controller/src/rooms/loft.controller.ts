import {
  ControllerStates,
  iRoomController,
  ROOM_COMMAND,
  RoomControllerParametersDTO,
} from '@automagical/contracts/controller-logic';
import { LightStateDTO } from '@automagical/contracts/home-assistant';
import { CronExpression } from '@automagical/contracts/utilities';
import {
  KunamiCodeService,
  LightManagerService,
  RoomController,
  StateManagerService,
} from '@automagical/controller-logic';
import {
  EntityManagerService,
  MediaPlayerDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { AutoLogService, Cron, PEAT, Trace } from '@automagical/utilities';
import dayjs from 'dayjs';
import { EventEmitter2 } from 'eventemitter2';

import { GLOBAL_TRANSITION } from '../typings';

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

const remote = 'sensor.loft_pico';

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
  remote,
  switches: ['switch.desk_light', 'sensor.loft_pico'],
})
export class LoftController implements iRoomController {
  // #region Constructors

  constructor(
    public readonly lightManager: LightManagerService,
    public readonly kunamiService: KunamiCodeService,
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly stateManager: StateManagerService,
    private readonly remoteService: MediaPlayerDomainService,
    private readonly eventEmitter: EventEmitter2,
    private readonly switchService: SwitchDomainService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff({
    count,
  }: RoomControllerParametersDTO): Promise<boolean> {
    if (!this.stateManager) {
      return;
    }
    await this.stateManager.removeFlag(AUTO_STATE);
    if (count === 2) {
      await this.remoteService.turnOff(MONITOR);
      this.eventEmitter.emit(GLOBAL_TRANSITION);
    }
    return true;
  }

  @Trace()
  public async areaOn(): Promise<void> {
    await this.stateManager.removeFlag(AUTO_STATE);
  }

  @Trace()
  public async favorite({
    count,
  }: RoomControllerParametersDTO): Promise<boolean> {
    await this.stateManager.addFlag(AUTO_STATE);
    const hour = dayjs().hour();
    if (count === 1) {
      // Set fan
      await this.lightManager.circadianLight(
        FAN_LIGHTS,
        this.fanAutoBrightness(),
      );
      // Set panel
      const panelBrightness = this.panelAutoBrightness();
      await (panelBrightness === 0
        ? this.lightManager.turnOffEntities(PANEL_LIGHTS)
        : this.lightManager.circadianLight(PANEL_LIGHTS, panelBrightness));
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
      ['games', 'master', 'downstairs'].forEach((room) =>
        this.eventEmitter.emit(ROOM_COMMAND(room, 'areaOff'), { count }),
      );
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
      await this.lightManager.turnOffEntities(FAN_LIGHTS);
      return;
    }
    await this.lightManager.circadianLight(FAN_LIGHTS, target);
  }

  @Cron('0 0 16 * * *')
  protected async hallwayOff(): Promise<void> {
    if (!(await this.stateManager.hasFlag(AUTO_STATE))) {
      return;
    }
    await this.switchService.turnOff('switch.loft_hallway_light');
  }

  @Cron('0 0 22 * * *')
  protected async lightOff(): Promise<void> {
    await this.switchService.turnOff('switch.back_desk_light');
  }

  @Cron('0 0 7 * * *')
  protected async lightOn(): Promise<void> {
    await this.switchService.turnOn('switch.back_desk_light');
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  protected async panelSchedule(): Promise<void> {
    if (!(await this.stateManager.hasFlag(AUTO_STATE))) {
      return;
    }
    const brightness = this.panelAutoBrightness();
    const result = await this.entityManager.getEntity<LightStateDTO>(
      PANEL_LIGHTS,
    );
    // this.logger.warn({ result: typeo });
    const [{ attributes }] = result;
    // const [{ attributes }] = await this.entityManager.getEntity<LightStateDTO>(
    //   PANEL_LIGHTS,
    // );
    if (brightness === 0) {
      await this.lightManager.turnOffEntities(PANEL_LIGHTS);
      return;
    }
    if (attributes.brightness === brightness) {
      return;
    }
    await this.lightManager.circadianLight(PANEL_LIGHTS, brightness);
  }

  @Cron('0 0 18 * * *')
  protected async stairsOff(): Promise<void> {
    if (!(await this.stateManager.hasFlag(AUTO_STATE))) {
      return;
    }
    await this.switchService.turnOff('switch.stair_lights');
  }

  @Cron('0 45 22 * * *')
  protected async windDown(): Promise<void> {
    if (!(await this.stateManager.hasFlag(AUTO_STATE))) {
      return;
    }
    this.switchService.turnOff(['switch.desk_light']);
  }

  @Trace()
  protected async onModuleInit(): Promise<void> {
    PEAT(2).forEach((count) =>
      this.kunamiService.addCommand({
        activate: {
          ignoreRelease: true,
          states: PEAT(count, ControllerStates.favorite),
        },
        callback: async () => {
          await this.favorite({ count });
        },
        name: `Favorite (${count})`,
      }),
    );
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
    if (hour === 8) {
      return 75;
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
        `panelAutoBrightness wind down {${dayjs().format('HH:mm:ss')}}`,
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
