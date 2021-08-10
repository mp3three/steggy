import { iRoomController } from '@automagical/contracts';
import { ControllerStates } from '@automagical/contracts/controller-logic';
import {
  KunamiCodeService,
  LightManagerService,
  RelayService,
  RoomController,
  StateManagerService,
} from '@automagical/controller-logic';
import { MediaPlayerDomainService } from '@automagical/home-assistant';
import { AutoLogService, Trace } from '@automagical/utilities';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';

const MONITOR = 'media_player.monitor';
const EVENING_BRIGHTNESS = 40;
const AUTO_STATE = 'AUTO_STATE';

const remote = 'sensor.games_pico';
@RoomController({
  friendlyName: 'Games Room',
  lights: [
    'light.games_1',
    'light.games_2',
    'light.games_3',
    'light.games_lamp',
  ],
  name: 'games',
  remote,
})
export class GamesRoomController implements iRoomController {
  // #region Constructors

  constructor(
    public readonly lightManager: LightManagerService,
    private readonly logger: AutoLogService,
    private readonly remoteService: MediaPlayerDomainService,
    private readonly kunamiService: KunamiCodeService,
    private readonly stateManager: StateManagerService,
    private readonly relayService: RelayService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(): Promise<void> {
    await this.stateManager.removeFlag(AUTO_STATE);
  }

  @Trace()
  public async areaOn(): Promise<void> {
    await this.stateManager.removeFlag(AUTO_STATE);
  }

  @Trace()
  public async favorite(count: number): Promise<boolean> {
    await this.stateManager.addFlag(AUTO_STATE);
    if (count === 1) {
      await this.lightManager.circadianLight(
        ['light.games_1', 'light.games_2', 'light.games_3', 'light.games_lamp'],
        30,
      );
      return false;
    }
    if (count === 2) {
      await this.relayService.turnOff(['loft', 'downstairs', 'master']);
      return false;
    }
    if (count === 3) {
      await this.remoteService.turnOff(MONITOR);
    }
    return false;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Cron(CronExpression.EVERY_30_SECONDS)
  protected async fanLightSchedule(): Promise<void> {
    if (!(await this.stateManager.hasFlag(AUTO_STATE))) {
      return;
    }
    const target = this.fanAutoBrightness();
    if (target === 0) {
      await this.lightManager.turnOffEntities([
        'light.games_1',
        'light.games_2',
        'light.games_3',
        'light.games_lamp',
      ]);
      return;
    }
    await this.lightManager.circadianLight(
      ['light.games_1', 'light.games_2', 'light.games_3', 'light.games_lamp'],
      target,
    );
  }

  protected async onApplicationBootstrap(): Promise<void> {
    this.kunamiService.addMatch(
      remote,
      new Map([
        [
          [ControllerStates.favorite, ControllerStates.none],
          () => {
            this.favorite(1);
          },
        ],
      ]),
    );
    setInterval(() => {
      this.fanLightSchedule();
    }, 30000);
    const GAMES_AUTO_MODE = await this.stateManager.hasFlag(AUTO_STATE);
    this.logger.debug({ GAMES_AUTO_MODE }, 'GAMES_AUTO_MODE');
  }

  // #endregion Protected Methods

  // #region Private Methods

  /**
   * Return what the brightness should be for the fan lights in auto mode
   */
  // eslint-disable-next-line radar/cognitive-complexity
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
    // Stay on all day until 8PM
    if (hour < 16) {
      return 100;
    }
    // Stay on all day until 8PM
    if (hour === 16) {
      const brightness = 100 - this.ticksThisHour(minute, second);
      const MINIMUM = EVENING_BRIGHTNESS * 2;
      return brightness < MINIMUM ? MINIMUM : brightness;
    }
    if (hour < 20) {
      return EVENING_BRIGHTNESS * 2;
    }
    // Start winding down
    if (hour === 20) {
      const brightness =
        EVENING_BRIGHTNESS * 2 - this.ticksThisHour(minute, second);
      return brightness < EVENING_BRIGHTNESS ? EVENING_BRIGHTNESS : brightness;
    }
    if (hour === 21) {
      return EVENING_BRIGHTNESS;
    }
    if (hour === 22) {
      const brightness =
        EVENING_BRIGHTNESS - Math.floor(this.ticksThisHour(minute, second) / 2);
      const MINIMUM = EVENING_BRIGHTNESS / 2;
      return brightness < MINIMUM ? MINIMUM : brightness;
    }
    if (hour < 23) {
      return EVENING_BRIGHTNESS / 2;
    }
    const brightness =
      EVENING_BRIGHTNESS / 2 - this.ticksThisHour(minute, second);
    return brightness < 10 ? 10 : brightness;
  }

  /**
   * Increase by 1 every 30 seconds
   */
  private ticksThisHour(minute: number, second: number): number {
    return minute * 2 + (second >= 30 ? 1 : 0);
  }

  // #endregion Private Methods
}
