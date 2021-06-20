import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { PinoLogger } from 'nestjs-pino';

export class MasterBedroomService {
  // #region Constructors

  constructor(
    @InjectLogger(MasterBedroomService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Private Methods

  private async onModuleInit() {
    return;
  }

  // #endregion Private Methods
}
