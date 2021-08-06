import { iRoomController } from '@automagical/contracts';
import {
  LightingControllerService,
  RoomController,
} from '@automagical/controller-logic';
import { MediaPlayerDomainService } from '@automagical/home-assistant';
import {
  CacheManagerService,
  InjectCache,
  InjectLogger,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';

import { ROOM_FAVORITE, ROOM_NAMES } from '../typings';

const MONITOR = 'media_player.monitor';
const EVENING_BRIGHTNESS = 40;

@RoomController({
  friendlyName: 'Games Room',
  lights: [
    'light.games_1',
    'light.games_2',
    'light.games_3',
    'light.games_lamp',
  ],
  name: 'games',
  remote: 'sensor.games_pico',
})
export class GamesRoomService implements iRoomController {
  // #region Object Properties

  public name = ROOM_NAMES.games;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger() private readonly logger: PinoLogger,
    @InjectCache()
    private readonly cacheManager: CacheManagerService,
    private readonly remoteService: MediaPlayerDomainService,
    private readonly lightingController: LightingControllerService,
  ) {}

  // #endregion Constructors

  // #region Private Accessors

  private get AUTO_MODE(): Promise<boolean> {
    return this.cacheManager.get(`GAMES_AUTO_MODE`);
  }

  // #endregion Private Accessors

  // #region Public Methods

  @OnEvent(ROOM_FAVORITE(ROOM_NAMES.games))
  @Trace()
  public async favorite(count: number): Promise<boolean> {
    await this.cacheManager.set(`GAMES_AUTO_MODE`, true, {
      ttl: 60 * 60 * 24,
    });
    if (count === 1) {
      await this.lightingController.circadianLight(
        ['light.games_1', 'light.games_2', 'light.games_3', 'light.games_lamp'],
        30,
      );
      return false;
    }
    if (count === 2) {
      await this.lightingController.roomOff(ROOM_NAMES.loft);
      await this.lightingController.roomOff(ROOM_NAMES.downstairs);
      await this.lightingController.roomOff(ROOM_NAMES.master);
      return false;
    }
    if (count === 3) {
      await this.remoteService.turnOff(MONITOR);
    }
    return false;
  }

  @Trace()
  public async areaOff(): Promise<boolean> {
    await this.cacheManager.del(`GAMES_AUTO_MODE`);
    return true;
  }

  @Trace()
  public async areaOn(): Promise<boolean> {
    await this.cacheManager.del(`GAMES_AUTO_MODE`);
    return true;
  }

  @Trace()
  public async combo(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async dimDown(): Promise<boolean> {
    await this.cacheManager.del(`GAMES_AUTO_MODE`);
    return true;
  }

  @Trace()
  public async dimUp(): Promise<boolean> {
    await this.cacheManager.del(`GAMES_AUTO_MODE`);
    return true;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Cron(CronExpression.EVERY_30_SECONDS)
  @Trace()
  protected async fanLightSchedule(): Promise<void> {
    if (!(await this.AUTO_MODE)) {
      return;
    }
    const target = this.fanAutoBrightness();
    if (target === 0) {
      await this.lightingController.turnOff([
        'light.games_1',
        'light.games_2',
        'light.games_3',
        'light.games_lamp',
      ]);
      return;
    }
    await this.lightingController.circadianLight(
      ['light.games_1', 'light.games_2', 'light.games_3', 'light.games_lamp'],
      target,
    );
  }

  @Trace()
  protected async onApplicationBootstrap(): Promise<void> {
    this.lightingController.setRoomController('sensor.games_pico', this, {
      devices: [
        {
          comboCount: 1,
          target: [
            'light.games_1',
            'light.games_2',
            'light.games_3',
            'light.games_lamp',
          ],
        },
      ],
    });
    const GAMES_AUTO_MODE = await this.cacheManager.get(`GAMES_AUTO_MODE`);
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