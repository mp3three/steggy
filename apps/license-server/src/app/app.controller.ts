import {
  FetchLicense,
  License,
  LicenseId,
  LicenseService,
} from '@automagical/licenses';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  NotImplementedException,
  Param,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { LicenseDTO } from '@automagical/contracts/formio-sdk';
import { CacheData } from '@automagical/contracts/licenses';

@Controller()
export class AppController {
  // #region Constructors

  constructor(
    @InjectPinoLogger(AppController.name) protected readonly logger: PinoLogger,
    private readonly licenseService: LicenseService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Get()
  public getData(): Record<string, string | symbol> {
    return {
      name: 'Licensing Server',
      version: '0',
    };
  }

  @Get('/key/:key/scope')
  @FetchLicense()
  public async getScope(
    @Param('key') key: string,
    @License() license: LicenseDTO,
    @LicenseId() licenseId: string,
  ): Promise<CacheData> {
    throw new NotImplementedException();
    const cacheData = await this.licenseService.getCache(licenseId);
    return cacheData;
  }

  @Get('/admin/license')
  @FetchLicense()
  public async loadLicensesAdmin(
    @License() license: LicenseDTO,
  ): Promise<LicenseDTO> {
    throw new NotImplementedException();
    return license;
    // return this.licenseService.licenseAdminFetch(license);
  }

  // #endregion Public Methods
}
