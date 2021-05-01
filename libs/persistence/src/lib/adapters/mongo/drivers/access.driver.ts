import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ACCESS_PERSISTENCE } from '@automagical/contracts/persistence';
import { iDriver } from '@automagical/persistence';
import { InjectLogger } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { BaseDriver } from './base.driver';

@Injectable()
export class AccessDriver extends BaseDriver {
  // #region Constructors

  constructor(
    @InjectLogger(AccessDriver, LIB_PERSISTENCE)
    protected readonly logger: PinoLogger,

    @Inject(() => ACCESS_PERSISTENCE)
    protected readonly driver: iDriver,
  ) {
    super();
  }

  // #endregion Constructors
}
