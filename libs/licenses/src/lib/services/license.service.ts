import { FormioSdkService, LicenseDTO, UserDTO } from '@automagical/formio-sdk';
import { Injectable } from '@nestjs/common';
import { createClient, RedisClient, ClientOpts } from 'redis';
import { Logger, env } from '@automagical/logger';
import { ObjectId } from 'mongodb';
import {
  LicenseResponseDTO,
  UtilizationResponseDTO,
} from '@automagical/contracts';
import { RedisService } from './redis.service';

@Injectable()
export class LicenseService {
  // #region Static Properties

  private static readonly FORM_PATH = 'license2/submission';

  // #endregion Static Properties

  // #region Object Properties

  private readonly config = Object.freeze({
    url: env.LICENSES_REDIS_URL,
    host: env.LICENSES_REDIS_HOST,
    port: env.LICENSES_REDIS_PORT,
    useSSL: env.LICENSES_REDIS_USESSL,
    password: env.LICENSES_REDIS_PASSWORD,
  });
  private readonly logger = Logger(LicenseService);

  private db: RedisClient = null;

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

  public loadLicenses(user: UserDTO) {
    return this.formioSdkService.fetch<LicenseResponseDTO>({
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

  public async loadLicensesAdmin(license: LicenseResponseDTO) {
    const utilizations = {
      apiServers: await this.redisService.totalEnabled(
        `license:${license.id}:apiServer`,
      ),
      pdfServers: await this.redisService.totalEnabled(
        `license:${license.id}:pdfServer`,
      ),
      tenants: await this.redisService.totalEnabled(
        `license:${license.id}:tenant`,
      ),
      projects: await this.redisService.totalEnabled(
        `license:${license.id}:project`,
      ),
      formManagers: await this.redisService.totalEnabled(
        `license:${license.id}:formManager`,
      ),
      vpat: await this.redisService.totalEnabled(`license:${license.id}:vpat`),
    };
    return {
      terms: await license.getTerms(),
      usage: utilizations,
      scopes: await license.getScope(),
    };
  }

  public onModuleBootstrap() {
    return;
  }

  public utilizationDelete() {}

  public utilizationDisable() {}

  public utilizationEnable() {}

  public utilizationFetch() {}

  // #endregion Public Methods

  // #region Private Methods

  private async getKeys(license: LicenseDTO) {
    const licenses = await this.formioSdkService.fetch<LicenseDTO[]>({
      url: LicenseService.FORM_PATH,
      filters: [
        {
          field: '_id',
          equals: license._id,
        },
      ],
    });

    const scopes;
    licenses.forEach((license) => {});

    if (!licenses.length) {
      return {};
    }

    const keys = [];
    // const scopes = Object.keys(this.scopesByKey);

    _.each(licenses[0].data.licenseKeys, (key) => {
      // Only add the key if it doesn't give us any additional scopes
      if (!_.difference(key.scope, scopes).length) {
        keys.push(key);
      }
    });

    return _.keyBy(keys, 'key');
  }

  private async getScope() {
    const scopes = {};

    // Get matching submission
    const submissions = await util.get(formPath, {
      qs: { _id: this.submission._id },
    });

    submissions[0].data.licenseKeys.forEach((key) => {
      key.scope.forEach((scope) => {
        scopes[scope] = true;
      });
    });

    return Object.keys(scopes);
  }

  private async getTerms() {
    return _.pick(this.submission.data, TERMS);
  }

  // get id() {
  //   return this.submission._id;
  // }

  // private isActive() {
  //   const now     = moment().toDate()
  //   const started = !this.data.startDate || moment(this.data.startDate).toDate() <= now
  //   const ended   =  this.data.endDate   && moment(this.data.endDate  ).toDate() <  now

  //   return started && !ended
  // }

  // private get isDevLicense() {
  //   return !!this.data.developmentLicense;
  // }
  private hasAuthScope(type) {
    return this.scopesByKey[type];
  }

  // #endregion Private Methods
}
