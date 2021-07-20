import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import {
  HASS_DOMAINS,
  HassStateDTO,
} from '@automagical/contracts/home-assistant';
import { InjectLogger, SolarCalcService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';

import { EntityService, HACallService } from '../services';

/**
 * https://www.home-assistant.io/integrations/light/
 */
@Injectable()
export class LightDomainService {
  // #region Object Properties

  private CIRCADIAN_LIGHTING = new Set<string>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(LightDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly solarCalcService: SolarCalcService,
    private readonly callService: HACallService,
    private readonly entityService: EntityService,
  ) {
    callService.domain = HASS_DOMAINS.light;
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async circadianLight(
    entity_id: string | string[],
    brightness_pct?: number,
  ): Promise<void> {
    if (typeof entity_id === 'string') {
      entity_id = [entity_id];
    }
    entity_id.forEach((id) => {
      if (!this.CIRCADIAN_LIGHTING.has(id)) {
        this.CIRCADIAN_LIGHTING.add(id);
      }
    });
    this.entityService.trackEntity(entity_id);
    const MIN_COLOR = 2500;
    const MAX_COLOR = 5500;
    const kelvin = (MAX_COLOR - MIN_COLOR) * this.getColorOffset() + MIN_COLOR;

    return await this.callService.call('turn_on', {
      brightness_pct,
      entity_id,
      kelvin,
    });
  }

  @Trace()
  public isOn(entityId: string): boolean {
    if (!this.entityService.ENTITIES.has(entityId)) {
      return false;
    }
    return this.entityService.ENTITIES.get(entityId).state === 'on';
  }

  /**
   * Brightness (as controlled by the dimmer) must remain in the 5-100% range
   *
   * To go under 5, turn off the light instead
   */
  @Trace()
  public async lightDim(entityId: string, amount: number): Promise<void> {
    let brightness = await this.lightBrightness(entityId);
    brightness = brightness + amount;
    if (brightness > 100) {
      brightness = 100;
    }
    if (brightness < 5) {
      brightness = 5;
    }
    this.logger.debug({ amount }, `${entityId} set brightness: ${brightness}%`);
    return await this.circadianLight(entityId, brightness);
  }

  @Trace()
  public async toggle(entityId: string | string[]): Promise<void> {
    this.entityService.trackEntity(entityId);
    return await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOff(entity_id: string | string[]): Promise<void> {
    if (typeof entity_id === 'string') {
      entity_id = [entity_id];
    }
    entity_id.forEach((id) => {
      if (this.CIRCADIAN_LIGHTING.has(id)) {
        this.CIRCADIAN_LIGHTING.delete(id);
      }
    });
    this.entityService.trackEntity(entity_id);
    return await this.callService.call('turn_off', {
      entity_id,
    });
  }

  @Trace()
  public async turnOn(entity_id: string | string[]): Promise<void> {
    this.entityService.trackEntity(entity_id);
    return await this.callService.call('turn_on', {
      entity_id: entity_id,
    });
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Cron(CronExpression.EVERY_MINUTE)
  @Trace()
  protected async circadianLightingUpdate(): Promise<void> {
    const activeLights: string[] = [];
    this.entityService.ENTITIES.forEach(async (entity, entity_id) => {
      if (entity.state !== 'on') {
        return;
      }
      activeLights.push(entity_id);
    });
    await this.circadianLight(activeLights);
  }

  /**
   * - If it's near solar noon, lights come on at full brightness
   * - If the sun is still out, come on as slightly dimmed
   * - Come on at a more dim level if it's dark out
   */
  protected getDefaultBrightness(): number {
    const offset = this.getColorOffset();

    if (offset > 0.3) {
      return 100;
    }
    if (offset > 0) {
      return 80;
    }
    return 60;
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

  /**
   * return 0 if off
   *
   * return brightness on a 0-100 scale
   */
  private lightBrightness(entityId: string) {
    const entity = this.entityService.ENTITIES.get(entityId) as HassStateDTO<
      string,
      {
        brightness: number;
      }
    >;
    if (entity.state === 'off') {
      return 0;
    }
    return Math.round((entity.attributes.brightness / 256) * 100);
  }

  // #endregion Private Methods
}
