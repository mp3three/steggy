import {
  CIRCADIAN_MAX_TEMP,
  CIRCADIAN_MIN_TEMP,
  DEFAULT_CIRCADIAN_MAX_TEMP,
  DEFAULT_CIRCADIAN_MIN_TEMP,
} from '@automagical/contracts/config';
import { LightingCacheDTO } from '@automagical/contracts/custom';
import {
  HomeAssistantCoreService,
  LightDomainService,
} from '@automagical/home-assistant';
import { InjectLogger, SolarCalcService, Trace } from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { each } from 'async';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';

const LIGHTING_CACHE_PREFIX = 'LIGHTING:';
const CACHE_KEY = (entity) => `${LIGHTING_CACHE_PREFIX}${entity}`;

@Injectable()
export class LightManagerService {
  // #region Object Properties

  private CURRENT_LIGHT_TEMPERATURE: number;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger() private readonly logger: PinoLogger,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly hassCoreService: HomeAssistantCoreService,
    private readonly solarCalcService: SolarCalcService,
    private readonly lightService: LightDomainService,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Retrieve a list of lights that are supposed to be turned on right now
   */
  @Trace()
  public async getActiveLights(): Promise<string[]> {
    const list = await this.cache.store.keys();
    return list
      .filter(
        (item) =>
          item.slice(0, LIGHTING_CACHE_PREFIX.length) === LIGHTING_CACHE_PREFIX,
      )
      .map((item) => item.slice(LIGHTING_CACHE_PREFIX.length));
  }

  @Trace()
  public async getState(entity_id: string): Promise<LightingCacheDTO> {
    return await this.cache.get(CACHE_KEY(entity_id));
  }

  @Trace()
  public async turnOff(entity_id: string | string[]): Promise<void> {
    if (Array.isArray(entity_id)) {
      each(entity_id, async (entity, callback) => {
        await this.turnOff(entity);
        callback();
      });
      return;
    }
    await this.cache.del(CACHE_KEY(entity_id));
    await this.hassCoreService.turnOff(entity_id);
  }

  @Trace()
  public async turnOn(
    entity_id: string | string[],
    settings: Partial<LightingCacheDTO>,
  ): Promise<void> {
    if (Array.isArray(entity_id)) {
      await each(entity_id, async (id, callback) => {
        await this.turnOn(id, settings);
        callback();
      });
      return;
    }
    if (settings.mode === 'circadian') {
      settings.kelvin = this.CURRENT_LIGHT_TEMPERATURE;
    }
    const current = await this.cache.get<LightingCacheDTO>(
      CACHE_KEY(entity_id),
    );
    settings.brightness ??= current?.brightness ?? 100;
    if (
      current?.brightness === settings.brightness &&
      current?.kelvin === settings.kelvin
    ) {
      return;
    }
    await this.cache.set(CACHE_KEY(entity_id), settings);
    await this.lightService.turnOn(entity_id, {
      brightness_pct: settings.brightness,
      kelvin: settings.kelvin,
    });
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Cron(CronExpression.EVERY_MINUTE)
  protected async circadianLightingUpdate(): Promise<void> {
    const kelvin = this.getCurrentTemperature();
    if (kelvin === this.CURRENT_LIGHT_TEMPERATURE) {
      return;
    }
    this.logger.debug(`Temperature updated: ${kelvin} k`);
    const lights = await this.getActiveLights();
    await each(lights, async (id, callback) => {
      const state = await this.getState(id);
      if (state.mode !== 'circadian' || state.kelvin === kelvin) {
        return;
      }
      await this.turnOn(id, {
        brightness: state.brightness,
        kelvin,
      });
      callback();
    });
  }

  // #endregion Protected Methods

  // #region Private Methods

  /**
   * Returns 0 when it's dark out, increasing to 1 at solar noon
   *
   * ### Future improvements
   *
   * The math needs work, this seems more thought out because math reasons:
   * https://github.com/claytonjn/hass-circadian_lighting/blob/master/custom_components/circadian_lighting/__init__.py#L206
   */
  private getColorOffset(): number {
    const calc = this.solarCalcService.SOLAR_CALC;
    const noon = dayjs(calc.solarNoon);
    const dusk = dayjs(calc.dusk);
    const dawn = dayjs(calc.dawn);
    const now = dayjs();

    if (now.isBefore(dawn)) {
      // After midnight, but before dawn
      return 0;
    }
    if (now.isBefore(noon)) {
      // After dawn, but before solar noon
      return Math.abs(noon.diff(now, 's') / noon.diff(dawn, 's') - 1);
    }
    if (now.isBefore(dusk)) {
      // Afternoon, but before dusk
      return Math.abs(noon.diff(now, 's') / noon.diff(dusk, 's') - 1);
    }
    // Until midnight
    return 0;
  }

  private getCurrentTemperature() {
    const MIN_COLOR = this.configService.get(
      CIRCADIAN_MIN_TEMP,
      DEFAULT_CIRCADIAN_MIN_TEMP,
    );
    const MAX_COLOR = this.configService.get(
      CIRCADIAN_MAX_TEMP,
      DEFAULT_CIRCADIAN_MAX_TEMP,
    );
    return Math.floor(
      (MAX_COLOR - MIN_COLOR) * this.getColorOffset() + MIN_COLOR,
    );
  }

  // #endregion Private Methods
}
