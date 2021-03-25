import { Logger } from '@automagical/logger';
import { Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/license')
export class LicenseController {
  // #region Object Properties

  private readonly logger = Logger(LicenseController);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly appService: AppService) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('/:id/admin')
  public getAdminInfo(@Param('id') id: string) {
    return this.appService.getAdminInfo(id);
  }

  @Get('/:id/terms')
  public getTerms(@Param('id') id: string) {
    this.appService.getTerms(id);
  }

  @Get('/:id/utilizations/:type')
  public getUtilizations(@Param('id') id: string, @Param('type') type: string) {
    return this.appService.getUtilizations(id, type);
  }

  @Get()
  public loadLicenses() {
    return this.appService.loadLicenses();
  }

  @Post('/:id/clear')
  public clearLicense(@Param('id') id: string) {
    return this.appService.clearLicense(id);
  }

  // #endregion Public Methods
}
