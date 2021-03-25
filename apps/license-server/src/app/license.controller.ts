import { LicenseService } from '@automagical/licenses';
import { Logger } from '@automagical/logger';
import { Controller, Get, Param, Post } from '@nestjs/common';

@Controller('/license')
export class LicenseController {
  // #region Object Properties

  private readonly logger = Logger(LicenseController);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly licenseService: LicenseService) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('/:id/admin')
  public getAdminInfo(@Param('id') id: string) {
    return this.licenseService.getAdminInfo(id);
  }

  @Get('/:id/terms')
  public getTerms(@Param('id') id: string) {
    this.licenseService.getTerms(id);
  }

  @Get('/:id/utilizations/:type')
  public getUtilizations(@Param('id') id: string, @Param('type') type: string) {
    return this.licenseService.getUtilizations(id, type);
  }

  @Get()
  public loadLicenses() {
    return this.licenseService.loadLicenses();
  }

  @Post('/:id/clear')
  public clearLicense(@Param('id') id: string) {
    return this.licenseService.clearLicense(id);
  }

  // #endregion Public Methods
}
