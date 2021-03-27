import { LicenseService } from '@automagical/licenses';
import { Logger } from '@automagical/logger';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '@automagical/authorization';

@Controller()
export class AppController {
  // #region Object Properties

  private readonly logger = Logger(AppController);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly licenseService: LicenseService) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('/key/:key/scope')
  public getScope(@Param('key') key: string) {
    return this.licenseService.getScope(key);
  }

  @Get('/admin/license')
  public loadLicensesAdmin() {
    return this.licenseService.licenseAdminFetch();
  }

  @UseGuards(LocalAuthGuard)
  @Get()
  public getData() {
    return {
      name: 'Licensing Server',
    };
  }

  // #endregion Public Methods
}
