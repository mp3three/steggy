import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SwitchEntityService {
  // #region Constructors

  constructor(
    @InjectLogger(SwitchEntityService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public turnOn(): Promise<void> {
    return;
  }

  public turnOff(): Promise<void> {
    return;
  }

  public toggle(): Promise<void> {
    return;
  }

  // #endregion Public Methods
}
