import { LicenseService } from '@automagical/licenses';
import { Logger } from '@automagical/logger';
import { Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserDTO } from '@automagical/formio-sdk';

@Controller('license')
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

  /**
   * Load licenses using x-jwt-token
   *
   * Data populated by middleware. See main.js
   */
  @Get()
  public loadLicenses(@Res() res: Response) {
    return res.locals.licenses;
  }

  @Post('/:id/clear')
  public clearLicense(@Param('id') id: string) {
    return this.licenseService.clearLicense(id);
  }

  // #endregion Public Methods
}
