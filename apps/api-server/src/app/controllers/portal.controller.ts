import { APP_API_SERVER } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { Controller, Get } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Controller()
export class PortalController {
  // #region Constructors

  constructor(
    @InjectLogger(PortalController, APP_API_SERVER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('config.js')
  public getConfig(): string {
    return ``;
  }

  // #endregion Public Methods
}
