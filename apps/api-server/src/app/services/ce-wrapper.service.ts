import { APP_API_SERVER } from '@automagical/contracts/constants';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class CEWrapperService {
  // #region Constructors

  constructor(
    @InjectLogger(CEWrapperService, APP_API_SERVER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Private Methods

  @Trace()
  private async onModuleInit() {
    return;
  }

  // #endregion Private Methods
}
