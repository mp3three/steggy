import { CIRCADIAN_UPDATE } from '@automagical/contracts/controller-logic';
import { CronExpression } from '@automagical/contracts/utilities';
import {
  Cron,
  InjectConfig,
  SolarCalcService,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { EventEmitter2 } from 'eventemitter2';

import { CIRCADIAN_MAX_TEMP, CIRCADIAN_MIN_TEMP } from '../config';

/**
 * This service is responsible for managing the current temperature for circadian lightining
 *
 * The temperature can be looked up on demand, and subscribed to via an observable
 */
@Injectable()
export class CircadianService {
  public CURRENT_LIGHT_TEMPERATURE: number;

  constructor(
    private readonly solarCalcService: SolarCalcService,
    @InjectConfig(CIRCADIAN_MAX_TEMP)
    private readonly maxTemperature: number,
    @InjectConfig(CIRCADIAN_MIN_TEMP)
    private readonly minTemperature: number,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  protected async updateKelvin(): Promise<void> {
    const kelvin = this.getCurrentTemperature();
    if (kelvin === this.CURRENT_LIGHT_TEMPERATURE) {
      return;
    }
    this.CURRENT_LIGHT_TEMPERATURE = kelvin;
    this.eventEmitter.emit(CIRCADIAN_UPDATE, kelvin);
  }

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
    const offset = this.getColorOffset();
    return Math.floor(
      (this.maxTemperature - this.minTemperature) * offset +
        this.minTemperature,
    );
  }
}
