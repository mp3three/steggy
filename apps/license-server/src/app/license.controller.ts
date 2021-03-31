import { LicenseService } from '@automagical/licenses';
import { Logger } from '@automagical/logger';
import { Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('license')
export class LicenseController {
  // #region Object Properties

  private readonly logger = Logger(LicenseController);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly licenseService: LicenseService) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('/:licenseId/admin')
  public getAdminInfo(@Param('licenseId') id: string) {
    // return this.licenseService.getAdminInfo(id);
  }

  @Get('/:licenseId/terms')
  public getTerms(@Param('licenseId') id: string) {
    // this.licenseService.getTerms(id);
  }

  @Get('/:licenseId/utilizations/:type')
  public getUtilizations(
    @Param('licenseId') id: string,
    @Param('type') type: string,
  ) {
    // return this.licenseService.getUtilizations(id, type);
  }

  /**
   * Load licenses using x-jwt-token
   *
   * Data populated by middleware. See main.js
   */
  @Get()
  public loadLicenses(@Res() res: Response) {
    return res.locals.licenses;
  }

  @Post('/:licenseId/clear')
  public clearLicense(@Param('licenseId') id: string) {
    // return this.licenseService.clearLicense(id);
  }

  // #endregion Public Methods
}
