import { FetchLicense, License, LicenseService } from '@automagical/licenses';
import { Logger } from '@automagical/logger';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LicenseDTO } from '../../../../libs/contracts/src';

@Controller()
export class AppController {
  // #region Object Properties

  private readonly logger = Logger(AppController);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly licenseService: LicenseService) {}

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
    return this.licenseService.getScope(key);
  }

  @Get('/admin/license')
  @FetchLicense()
  public loadLicensesAdmin(@License() license: LicenseDTO) {
    return this.licenseService.licenseAdminFetch(license);
  }

  // #endregion Public Methods
}
