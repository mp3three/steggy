import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { HACallService } from '../services';

@Injectable()
export class ClimateDomainService {
  // #region Constructors

  constructor(
    @InjectLogger(ClimateDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public setAuxHeat(): Promise<void> {
    return;
  }

  @Trace()
  public setFanMode(): Promise<void> {
    return;
  }

  @Trace()
  public setHumidity(): Promise<void> {
    return;
  }

  @Trace()
  public setHvacMode(): Promise<void> {
    return;
  }

  @Trace()
  public setPresetMode(): Promise<void> {
    return;
  }

  @Trace()
  public setSwingMode(): Promise<void> {
    return;
  }

  @Trace()
  public setTemperature(): Promise<void> {
    return;
  }

  @Trace()
  public turnOff(): Promise<void> {
    return;
  }

  @Trace()
  public turnOn(): Promise<void> {
    return;
  }

  // #endregion Public Methods
}
