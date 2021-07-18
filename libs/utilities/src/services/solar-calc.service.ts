import { LIB_UTILS } from '@automagical/contracts/constants';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import SolarCalc from 'solar-calc';
import SolarCalcType from 'solar-calc/types/solarCalc';

import { InjectLogger } from '../decorators';

export class SolarCalcService {
  // #region Object Properties

  private _SOLAR_CALC;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(SolarCalcService, LIB_UTILS)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Accessors

  public get SOLAR_CALC(): SolarCalcType {
    if (this._SOLAR_CALC) {
      return this._SOLAR_CALC;
    }
    setTimeout(() => (this._SOLAR_CALC = undefined), 1000 * 30);
    // typescript is wrong this time, it works as expected for me
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new SolarCalc(
      new Date(),
      // TODO: Populated via home assistant
      Number(this.configService.get('application.LAT')),
      Number(this.configService.get('application.LONG')),
    );
  }

  // #endregion Public Accessors
}
