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

/**
 * TODO 💣☄️🔥🧨
 */
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

  public licenseIdFromReq(req: Request) {
    return (
      req.headers['x-license-key'] ||
      req.params?.licenseKey ||
      req.body?.licenseKey ||
      null
    );
  }

  public utilizationDelete() {}

  public utilizationDisable() {}

  public utilizationEnable() {}

  public async utilizationUpdate(
    update: UtilizationUpdateDTO,
    license: LicenseDTO,
  ): Promise<UtilizationResponseDTO> {
    const { licenseKeys, developmentLicense: devLicense } = license.data;
    const auth = licenseKeys.find((key) => key.key === update.licenseKey);
    if (!auth) {
      throw new ForbiddenException('Invalid license key');
    }
    if (!this.isActive(license)) {
      throw new ForbiddenException(`License expired`);
    }
    // * <Fix>: Authoring mode
    // * stages should be synonymous with livestage
    switch (update.type) {
      case LicenseScopes.stage:
        update.type = LicenseScopes.livestage;
        break;
      case LicenseScopes.formRequest:
        if (update.remote) {
          // Hosted Only
          break;
        }
        // Verify: Forms (Per Project, Tracked as Total)
        break;
    }
    // * </Fix>
    if (!(auth.scope as string[]).includes(update.type as string)) {
      throw new ForbiddenException(`Missing license key scope: ${update.type}`);
    }
    const keys: Record<string, LicenseKeyDTO> = {};
    licenseKeys.forEach((i) => (keys[i.key] = i));
    // ! Hash
    return {
      hash: '',
      ...update,
      used: await this.monthlyUsage(license, auth, update),
      licenseKey: update.licenseKey,
      projectId: update.projectId,
      licenseId: license._id,
      terms: license.data,
      type: update.type,
      devLicense,
      keys,
    };
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async getUsage(projectId: string) {
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

  /**
   * Get relevant identifier based on scope
   */
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

  /**
   * # Hosted Only
   * ## Utilization update for monthly totals
   *
   * > **Per Project, Tracked Monthly**
   *
   * - Form Loads
   * - Submission Requests
   * - Emails
   * - PDF Generations
   *
   * ## Related to:
   * > **Per Project, Tracked as Total**
   *
   * - Forms
   * - Hosted PDF Documents
   */
  private async monthlyUsage(
    license: LicenseDTO,
    auth: LicenseKeyDTO,
    update: UtilizationUpdateDTO,
  ): Promise<LicenseMonthlyUsageDTO> {
    const type = `${update.type}s` as keyof UtilizationResponseDTO;
    const limit = license.data[type] || 0;
    const { key } = auth;
    // TODO dayjs() instead of date shenanigains
    const now = new Date();
    const keyParts = [key, now.getUTCFullYear(), now.getUTCMonth()];

    const calls = await this.redisService.countCalls(keyParts.join(':'));

    if (!limit || calls <= limit) {
      keyParts.push(now.getUTCMonth());
      await this.redisService.addMonthRecord(keyParts.join(':'), update);
      return this.getUsage(this.getMember(license, update.type, update));
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
    const id = await this.getMember(
      license,
      update.type as LicenseScopes,
      update,
    );

    const total = await this.redisService.totalEnabled(set);

    let status = await this.redisService.totalStatus(set, id);
    if (status === null) {
      status = 'null';
    }

    // The function for set info of the utilization.
    const recordInfo = () => {
      const { licenseKey, type, ...info } = update;
      return this.redisService.setInfo(`info:${type}:${id}`, {
        ...info,
        id,
        status,
        lastCheck: new Date().toISOString(),
      });
    };
    // The function for get info of the utilization.
    const getItemInfo = () => {
      return this.redisService.getInfo(`info:${type}:${id}`);
    };

    if (status === '0') {
      if (update?.remote === true) {
        return record;
      }
      const itemInfo = await getItemInfo();
      // If the information about the utilization is equal null.
      if (itemInfo === null) {
        // Record the information about the utilization.
        await recordInfo();
      }

      throw new ForbiddenException(
        `${update.title} license utilization is disabled`,
      );
    }

    if (
      total > limit ||
      (total === limit && (status === 'null' || status === null))
    ) {
      const itemInfo = await getItemInfo();
      // If over limit and this is a new item, disable it.
      if (status === 'null' || status === null || itemInfo === null) {
        // Record the information about the utilization.
        recordInfo();
      }
      await this.redisService.totalDisable(set, id);
      status = '0';
      throw new ForbiddenException(`${update.title} limit reached`);
    }

    if (status === 'null' || status === null) {
      await this.redisService.totalEnable(set, id);
      status = '1';
    }

    // Record the information about the utilization.
    recordInfo();

    return record;
  }

  // #endregion Private Methods
}
