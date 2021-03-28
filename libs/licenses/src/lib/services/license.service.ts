import {
  LicenseDTO,
  LicenseKeyDTO,
  LicenseMonthlyUsageDTO,
  LicenseScopes,
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
    if (update.type === LicenseScopes.stage) {
      update.type = LicenseScopes.livestage;
    }
    // * </Fix>
    const keys: Record<string, LicenseKeyDTO> = {};
    licence.data.licenseKeys.forEach((i) => (keys[i.key] = i));
    return {
      hash: '',
      ...update,
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

  // #region Protected Methods

  protected async getUsage(projectId) {
    const now = new Date();
    const yearMonth = `${now.getUTCFullYear()}:${now.getUTCMonth()}`;
    return {
      emails: await this.redisService.countCalls(
        `project:${projectId}:email:${yearMonth}`,
      ),
      forms: await this.redisService.totalEnabled(`project:${projectId}:form`),
      formRequests: await this.redisService.countCalls(
        `project:${projectId}:formRequest:${yearMonth}`,
      ),
      pdfs: await this.redisService.totalEnabled(`project:${projectId}:pdf`),
      pdfDownloads: await this.redisService.countCalls(
        `project:${projectId}:pdfDownload:${yearMonth}`,
      ),
      submissionRequests: await this.redisService.countCalls(
        `project:${projectId}:submissionRequest:${yearMonth}`,
      ),
    };
  }

  // #endregion Protected Methods

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

  private getMember(
    license: LicenseDTO,
    scope: LicenseScopes,
    update: UtilizationUpdateDTO,
  ) {
    switch (scope) {
      case LicenseScopes.accessibility:
      case LicenseScopes.project:
      case LicenseScopes.formManager:
        return update.projectId;
      case LicenseScopes.stage:
      case LicenseScopes.livestage:
        return update.stageId;
      case LicenseScopes.tenant:
        return update.tenantId;
      case LicenseScopes.apiServer:
      default:
        this.logger.alert(`Unknown scope: ${scope}`);
        return null;
    }
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
      // TODO: Finish logic
      // const out = await this.redisService.addMonthRecord(
      //   `${my}:${now.getUTCDate()}`,
      //   license,
      // );
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

  private async totalUsage(
    license: LicenseDTO,
    auth: LicenseKeyDTO,
    update: UtilizationUpdateDTO,
  ) {
    const record: Partial<UtilizationResponseDTO> = {
      type: update.type,
      licenseId: license._id,
      licenseKey: auth.key,
    };
    const type = `${update.type}s` as keyof UtilizationResponseDTO;
    const limit = license.data[type] || 0;

    const set = `license:${record.licenseId}:${record.type}`;
    const member = this.getMember(
      license,
      update.type as LicenseScopes,
      update,
    );

    // const total = await this.redis.totalEnabled(set);

    // // Allow checking before an item is created.
    // if (this.getMember(record) === 'new') {
    //   if (total >= limit) {
    //     throw new Error.PaymentRequired(`${this.title} limit reached`);
    //   }
    //   return record;
    // }

    // let status = await this.redis.totalStatus(set, member);
    // if (status === null) {
    //   status = 'null';
    // }

    // // The function for set info of the utilization.
    // const recordInfo = () => {
    //   const {licenseKey, type, timestamp, ...info} = data;
    //   const id = this.getMember(data);
    //   this.redis.setInfo(`info:${type}:${id}`, {
    //     ...info,
    //     id,
    //     status,
    //     lastCheck: new Date().toISOString(),
    //   });
    // };
    // // The function for get info of the utilization.
    // const getItemInfo = () => {
    //   const {type} = data;
    //   const id = this.getMember(data);
    //   return this.redis.getInfo(`info:${type}:${id}`);
    // };

    // if (status === '0') {
    //   if (data && data.remote === true) {
    //     return record;
    //   }
    //   const itemInfo = await getItemInfo();
    //   // If the information about the utilization is equal null.
    //   if (itemInfo === null) {
    //      // Record the information about the utilization.
    //      recordInfo();
    //   }

    //   throw new Error.PaymentRequired(`${this.title} license utilization is disabled`);
    // }

    // if (total > limit || (total === limit && (status === 'null' || status === null))) {
    //   const itemInfo = await getItemInfo();
    //   // If over limit and this is a new item, disable it.
    //   if (status === 'null' || status === null || itemInfo === null) {
    //     // Record the information about the utilization.
    //     recordInfo();
    //   }
    //   await this.redis.totalDisable(set, member);
    //   status = '0';
    //   throw new Error.PaymentRequired(`${this.title} limit reached`);
    // }

    // if (status === 'null' || status === null) {
    //   await this.redis.totalEnable(set, member);
    //   status = '1';
    // }

    // // Record the information about the utilization.
    // if (!sub) {
    //   recordInfo();
    // }

    // return record;
  }

  // #endregion Private Methods
}
