import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // #region Public Methods

  @Get()
  public helloWorld(): string {
    return 'Sup';
  }

  // #endregion Public Methods
}
