import { CacheData, LicenseDTO, REPO_VERSION } from '@automagical/contracts';
import {
  FetchLicense,
  License,
  LicenseId,
  LicenseService,
} from '@automagical/licenses';
import { Logger } from '@automagical/logger';
import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  NotImplementedException,
  Param,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {
  // #region Object Properties

  private readonly logger = Logger(AppController);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly licenseService: LicenseService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Get()
  public getData(): Record<string, string | symbol> {
    return {
      name: 'Licensing Server',
      version: REPO_VERSION,
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
