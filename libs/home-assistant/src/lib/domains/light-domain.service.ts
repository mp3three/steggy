import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { HACallService } from '../services';

@Injectable()
export class LightDomainService {
  // #region Constructors

  constructor(
    @InjectLogger(LightDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public toggle(): Promise<void> {
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
