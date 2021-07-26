import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { InjectLogger, Subscribe } from '@automagical/utilities';
import { PinoLogger } from 'nestjs-pino';

export class GarageService {
  // #region Constructors

  constructor(
    @InjectLogger(GarageService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Subscribe('test')
  protected subscriber(): void {
    return;
  }

  // #endregion Protected Methods
}
