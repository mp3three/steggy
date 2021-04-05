import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // #region Public Methods

  @Get()
  public helloWorld(): string {
    console.log('HELLO_WORLD');
    return 'Sup';
  }

  // #endregion Public Methods
}
