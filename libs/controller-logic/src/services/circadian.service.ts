import {
  CIRCADIAN_MAX_TEMP,
  CIRCADIAN_MIN_TEMP,
} from '@automagical/contracts/config';
import { CIRCADIAN_UPDATE } from '@automagical/contracts/controller-logic';
import {
  AutoConfigService,
  SolarCalcService,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';

/**
 * This service is responsible for managing the current temperature for circadian lightining
 *
 * The temperature can be looked up on demand, and subscribed to via an observable
 */
@Injectable()
export class CircadianService {
  // #region Object Properties

  public CURRENT_LIGHT_TEMPERATURE: number;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly solarCalcService: SolarCalcService,
    private readonly configService: AutoConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Cron(CronExpression.EVERY_MINUTE)
  @Trace()
  protected async circadianLightingUpdate(): Promise<void> {
    const kelvin = this.getCurrentTemperature();
    if (kelvin === this.CURRENT_LIGHT_TEMPERATURE) {
      return;
    }
    this.CURRENT_LIGHT_TEMPERATURE = kelvin;
    this.eventEmitter.emit(CIRCADIAN_UPDATE, kelvin);
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
  @Trace()
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

  @Trace()
  private getCurrentTemperature() {
    const MIN_COLOR = this.configService.get<number>(CIRCADIAN_MIN_TEMP);
    const MAX_COLOR = this.configService.get<number>(CIRCADIAN_MAX_TEMP);
    return Math.floor(
      (MAX_COLOR - MIN_COLOR) * this.getColorOffset() + MIN_COLOR,
    );
  }

  // #endregion Private Methods
}
