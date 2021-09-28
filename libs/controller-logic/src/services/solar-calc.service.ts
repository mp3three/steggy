import { InjectConfig } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import SolarCalc from 'solar-calc';
import SolarCalcType from 'solar-calc/types/solarCalc';

import { FORCE_EVENING_HOUR, LATITUDE, LONGITUDE } from '../config';

const CALC_EXPIRE = 30000;

@Injectable()
export class SolarCalcService {
  constructor(
    @InjectConfig(LONGITUDE) private readonly longitude: string,
    @InjectConfig(LATITUDE) private readonly latitude: string,
    @InjectConfig(FORCE_EVENING_HOUR) private readonly eveningHour: number,
  ) {}
  private CALCULATOR;

  public get IS_EVENING(): boolean {
    // Considered evening if the sun has set, or it's past 6PM
    const now = dayjs();
    return (
      now.isAfter(this.SOLAR_CALC.goldenHourStart) ||
      now.isAfter(now.startOf('day').add(this.eveningHour, 'hour')) ||
      now.isBefore(this.SOLAR_CALC.sunrise)
    );
  }

  public get SOLAR_CALC(): SolarCalcType {
    if (this.CALCULATOR) {
      return this.CALCULATOR;
    }
    setTimeout(() => (this.CALCULATOR = undefined), CALC_EXPIRE);
    // @ts-expect-error Typescript is wrong this time, this works as expected
    return new SolarCalc(
      new Date(),
      // TODO: Populated via home assistant?
      Number(this.latitude),
      Number(this.longitude),
    );
  }
}
