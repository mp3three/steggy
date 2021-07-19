import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { PinoLogger } from 'nestjs-pino';

export class GamesService {
  // #region Constructors

  constructor(
    @InjectLogger(GamesService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors
}
