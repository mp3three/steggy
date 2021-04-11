import {
  AllLicenses,
  FetchLicense,
  LicenseService,
} from '@automagical/licenses';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Controller, Get, Param, Post } from '@nestjs/common';
import { LicenseDTO } from '@automagical/contracts/formio-sdk';

@Controller('license')
export class LicenseController {
  // #region Constructors

  constructor(
    @InjectPinoLogger(LicenseController.name)
    protected readonly logger: PinoLogger,
    private readonly licenseService: LicenseService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('/:licenseId/admin')
  public getAdminInfo(@Param('licenseId') id: string): string {
    // return this.licenseService.getAdminInfo(id);
    return id;
  }

  @Get('/:licenseId/terms')
  public getTerms(@Param('licenseId') id: string): string {
    // this.licenseService.getTerms(id);
    return id;
  }

  @Get('/:licenseId/utilizations/:type')
  public getUtilizations(
    @Param('licenseId') id: string,
    @Param('type') type: string,
  ): void {
    this.logger.debug(id, type);
    // return this.licenseService.getUtilizations(id, type);
  }

  @Get()
  @FetchLicense()
  public loadLicenses(@AllLicenses() licenses: LicenseDTO[]): LicenseDTO[] {
    return licenses;
  }

  @Post('/:licenseId/clear')
  public clearLicense(@Param('licenseId') id: string): string {
    // return this.licenseService.clearLicense(id);
    return id;
  }

  // #endregion Public Methods
}
