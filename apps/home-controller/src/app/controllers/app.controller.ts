import { Logger } from '@automagical/logger';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // #region Object Properties

  private readonly logger = Logger(AppController);

  // #endregion Object Properties

  // #region Public Methods

  @Get()
  public helloWorld(): string {
    return 'Sup';
  }

  // #endregion Public Methods
}
