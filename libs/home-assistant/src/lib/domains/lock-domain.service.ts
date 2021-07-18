import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { HACallService } from '../services';

@Injectable()
export class LockDomainService {
  // #region Constructors

  constructor(
    @InjectLogger(LockDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public lock(): Promise<void> {
    return;
  }

  @Trace()
  public open(): Promise<void> {
    return;
  }

  @Trace()
  public unlock(): Promise<void> {
    return;
  }

  // #endregion Public Methods
}
