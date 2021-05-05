import { APP_SQL_CONNECTOR } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { Controller, Get } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { AppService } from './app.service';

@Controller('sqlconnector')
export class ConnectorController {
  // #region Constructors

  constructor(
    @InjectLogger(ConnectorController, APP_SQL_CONNECTOR)
    private readonly logger: PinoLogger,
    private readonly appService: AppService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('/refresh')
  public async refresh(): Promise<void> {
    return;
  }

  // #endregion Public Methods
}
