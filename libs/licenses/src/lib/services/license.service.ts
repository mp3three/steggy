import {
  LicenseDTO,
  UserDTO,
  UtilizationResponseDTO,
  UtilizationUpdateDTO,
} from '@automagical/contracts';
import { FetchWith, FormioSdkService } from '@automagical/formio-sdk';
import { env, Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import dayjs = require('dayjs');
import { RedisService } from './redis.service';

@Injectable()
export class LicenseService {
  // #region Static Properties

  private static readonly FORM_PATH = 'license2/submission';

  // #endregion Static Properties

  // #region Object Properties

  /**
   * TODO Remove this legacy item
   */
  private readonly config = Object.freeze({
    url: env.LICENSES_REDIS_URL,
    host: env.LICENSES_REDIS_HOST,
    port: env.LICENSES_REDIS_PORT,
    useSSL: env.LICENSES_REDIS_USESSL,
    password: env.LICENSES_REDIS_PASSWORD,
  });
  private readonly logger = Logger(LicenseService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly formioSdkService: FormioSdkService,
    private readonly redisService: RedisService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public clearLicense(id: string) {
    return id;
  }

  public getAdminInfo(id: string) {
    return id;
  }

  public getScope(key: string) {
    return key;
  }

  public getTerms(id: string) {
    return id;
  }

  public getUtilizations(id: string, type: string) {
    return id;
  }

  public isActive(license: LicenseDTO) {
    const started =
      !license.data.startDate || dayjs().isAfter(dayjs(license.data.startDate));
    const ended =
      license.data.endDate && dayjs().isAfter(dayjs(license.data.startDate));

    return started && !ended;
  }

  public async licenseAdminFetch(license: LicenseDTO) {
    return {
      // terms: await this.getTerms(),
      // scopes: await this.getScope(),
      usage: {
        apiServers: await this.redisService.totalEnabled(
          `license:${license._id}:apiServer`,
        ),
        pdfServers: await this.redisService.totalEnabled(
          `license:${license._id}:pdfServer`,
        ),
        tenants: await this.redisService.totalEnabled(
          `license:${license._id}:tenant`,
        ),
        projects: await this.redisService.totalEnabled(
          `license:${license._id}:project`,
        ),
        formManagers: await this.redisService.totalEnabled(
          `license:${license._id}:formManager`,
        ),
        vpat: await this.redisService.totalEnabled(
          `license:${license._id}:vpat`,
        ),
      },
    };
  }

  public licenseFetch(id: string) {
    return this.fetch<LicenseDTO>({
      url: LicenseService.FORM_PATH,
      filters: [
        {
          field: '_id',
          equals: id,
        },
      ],
    });
  }

  public licenseFetchByUser(user: UserDTO) {
    return this.fetch<LicenseDTO[]>({
      url: LicenseService.FORM_PATH,
      filters: [
        {
          field: 'data.user._id',
          equals: user._id,
        },
        {
          limit: 100,
        },
      ],
    });
  }

  public utilizationDelete() {}

  public utilizationDisable() {}

  public utilizationEnable() {}

  public utilizationUpdate(
    update: UtilizationUpdateDTO,
  ): Promise<UtilizationResponseDTO> {
    return null;
  }

  // #endregion Public Methods

  // #region Private Methods

  private fetch<T>(args: FetchWith) {
    return this.formioSdkService.fetch<T>({
      baseUrl: process.env.FORMIO_SDK_LICENSE_SERVER_base_url,
      ...args,
    });
  }

  private async getCachedItem(url: string, cacheKey: string) {
    const result = await this.redisService.getInfo(cacheKey);

    if (result && result.item) {
      if (dayjs(result.lastUpdate).isBefore(dayjs().subtract(15, 'minutes'))) {
        process.nextTick(() => this.refreshCache(url, cacheKey));
      }
      return JSON.parse(result.item);
    }
    return this.refreshCache(url, cacheKey);
  }

  private async refreshCache(url: string, cacheKey: string) {
    const newItems = await this.fetch<LicenseDTO[]>({ url });
    const data = newItems[0];
    this.redisService.setInfo(cacheKey, {
      item: JSON.stringify(newItems[0]),
      lastUpdate: dayjs(),
    });
    return data;
  }

  // #endregion Private Methods
}
