import { Logger } from '@automagical/logger';
import { Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  // #region Object Properties

  private readonly logger = Logger(AppController);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly appService: AppService) {}

  // #endregion Constructors

  // #region Public Methods

  @Get()
  public getData() {
    return {
      name: 'Licensing Server',
    };
  }

  @Get('/key/:key/scope')
  public getScope(@Param('key') key: string) {
    return this.appService.getScope(key);
  }

  @Get('/admin/license')
  public loadLicensesAdmin() {
    return this.appService.loadLicensesAdmin();
  }

  // #endregion Public Methods
}
