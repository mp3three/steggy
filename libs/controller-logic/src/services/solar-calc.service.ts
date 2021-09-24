import { InjectConfig } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import SolarCalc from 'solar-calc';
import SolarCalcType from 'solar-calc/types/solarCalc';

import { LATITUDE, LONGITUDE } from '../config';

@Injectable()
export class SolarCalcService {
  private CALCULATOR;

  constructor(
    @InjectConfig(LONGITUDE) private readonly longitude: string,
    @InjectConfig(LATITUDE) private readonly latitude: string,
  ) {}

  public get IS_EVENING(): boolean {
    // Considered evening if the sun has set, or it's past 6PM
    const now = dayjs();
    return (
      now.isAfter(this.SOLAR_CALC.goldenHourStart) ||
      now.isAfter(now.startOf('day').add(12 + 6, 'hour')) ||
      now.isBefore(this.SOLAR_CALC.sunrise)
    );
  }

  public get SOLAR_CALC(): SolarCalcType {
    if (this.CALCULATOR) {
      return this.CALCULATOR;
    }
    setTimeout(() => (this.CALCULATOR = undefined), 1000 * 30);
    // @ts-expect-error Typescript is wrong this time, it works as expected for me
    return new SolarCalc(
      new Date(),
      // TODO: Populated via home assistant
      Number(this.latitude),
      Number(this.longitude),
    );
  }
}
