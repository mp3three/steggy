import { LATITUDE, LONGITUDE } from '@automagical/contracts/config';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import SolarCalc from 'solar-calc';
import SolarCalcType from 'solar-calc/types/solarCalc';
import { AutoConfigService } from './auto-config.service';

@Injectable()
export class SolarCalcService {
  // #region Object Properties

  private CALCULATOR;

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly configService: AutoConfigService) {}

  // #endregion Constructors

  // #region Public Accessors

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
    // typescript is wrong this time, it works as expected for me
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new SolarCalc(
      new Date(),
      // TODO: Populated via home assistant
      Number(this.configService.get(LATITUDE)),
      Number(this.configService.get(LONGITUDE)),
    );
  }

  // #endregion Public Accessors
}
