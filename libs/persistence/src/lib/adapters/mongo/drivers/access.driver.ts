import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { AccessDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AccessSchema } from '../models';

@Injectable()
export class AccessDriver {
  // #region Constructors

  constructor(
    @InjectLogger(AccessDriver, LIB_PERSISTENCE)
    protected readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async create(arg: AccessDTO): Promise<AccessDTO> {
    // AccessSchema
    // return await this.driver.create(arg);
    return null;
  }

  // #endregion Public Methods
}
