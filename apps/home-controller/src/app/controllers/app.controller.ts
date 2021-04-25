import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { Controller, Get } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Controller()
export class AppController {
  // #region Constructors

  constructor(
    @InjectLogger(AppController, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Get()
  public helloWorld(): string {
    return 'Sup';
  }

  // #endregion Public Methods
}
