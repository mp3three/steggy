import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { InjectLogger, MqttService } from '@automagical/utilities';
import { PinoLogger } from 'nestjs-pino';

export class GarageService {
  // #region Constructors

  constructor(
    @InjectLogger(GarageService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
    private readonly mqttService: MqttService,
  ) {}

  // #endregion Constructors
}
