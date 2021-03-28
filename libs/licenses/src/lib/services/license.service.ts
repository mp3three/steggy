import {
  LicenseDTO,
  LicenseKeyDTO,
  LicenseMonthlyUsageDTO,
  PROJECT_TYPES,
  UserDTO,
  UtilizationResponseDTO,
  UtilizationUpdateDTO,
} from '@automagical/contracts';
import { FetchWith, FormioSdkService } from '@automagical/formio-sdk';
import { env, Logger } from '@automagical/logger';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Request } from 'express';
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

  public licenceIdFromReq(req: Request) {
    return (
      req.headers['x-license-key'] ||
      req.params?.licenseKey ||
      req.body?.licenseKey ||
      null
    );
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

  public async utilizationUpdate(
    update: UtilizationUpdateDTO,
    licence: LicenseDTO,
  ): Promise<UtilizationResponseDTO> {
    const key = licence.data.licenseKeys.find(
      (key) => key.key === update.licenseKey,
    );
    if (!key) {
      throw new ForbiddenException('Invalid license key');
    }

    // * <Fix>: Authoring mode
    if (update.type === PROJECT_TYPES.stage) {
      update.type = PROJECT_TYPES.livestage;
    }
    // * </Fix>
    const keys: Record<string, LicenseKeyDTO> = {};
    licence.data.licenseKeys.forEach((i) => (keys[i.key] = i));
    return {
      licenseId: licence._id,
      licenseKey: key.key,
      devLicense: licence.data.developmentLicense,
      type: update.type,
      projectId: update.projectId,
      keys,
      terms: licence.data,
      used: await this.monthlyUsage(licence, key, update),
    };
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

  private async monthlyUsage(
    license: LicenseDTO,
    auth: LicenseKeyDTO,
    update: UtilizationUpdateDTO,
  ): Promise<LicenseMonthlyUsageDTO> {
    if (!this.isActive(license)) {
      throw new ForbiddenException(`License expired`);
    }
    if (!(auth.scope as string[]).includes(update.type as string)) {
      throw new ForbiddenException(`Missing license key scope: ${update.type}`);
    }
    const type = `${update.type}s` as keyof UtilizationResponseDTO;
    const limit = license.data[type] || 0;

    const { key } = auth;

    const now = new Date();
    const my = `${key}:${now.getUTCFullYear()}:${now.getUTCMonth()}`;
    const calls = await this.redisService.countCalls(my);

    if (!limit || calls < limit) {
      const out = await this.redisService.addMonthRecord(
        `${my}:${now.getUTCDate()}`,
        license,
      );
    }

    throw new ForbiddenException(`${update.title} limit reached`);
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
