import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class GuestBedroomService {
  // #region Constructors

  constructor(
    @InjectLogger(GuestBedroomService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors
}
