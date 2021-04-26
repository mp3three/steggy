import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { Controller, Get } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { EntityService } from '../services';

@Controller('entity')
export class EntityController {
  // #region Constructors

  constructor(
    @InjectLogger(EntityController, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
    private readonly entityService: EntityService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('')
  public async listWithAttribute(): Promise<void> {
    return;
  }

  // #endregion Public Methods

  // #region Private Methods

  private async onModuleInit() {
    this.logger.warn('hit');
    return;
  }

  // #endregion Private Methods
}
