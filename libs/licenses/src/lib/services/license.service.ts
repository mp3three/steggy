import { LIB_LICENSES } from '@automagical/contracts/constants';
import {
  LicenseDTO,
  SubmissionDTO,
  UserDTO,
} from '@automagical/contracts/formio-sdk';
import {
  CacheData,
  CacheEnvironmentDTO,
  CacheFormDTO,
  CacheProjectDTO,
  LicenseKeyDTO,
  LicenseMonthlyUsageDTO,
  LicenseScopes,
  LicenseTrackedLicenseScopes,
  LicenseTrackedMonthlyScopes,
  LicenseTrackedProjectScopes,
  UtilizationResponseDTO,
  UtilizationResponseTermsDTO,
  UtilizationUpdateDTO,
} from '@automagical/contracts/licenses';
import {
  FetchWith,
  FormioSdkService,
  LICENSE_SERVER,
} from '@automagical/formio-sdk';
import { InjectLogger } from '@automagical/utilities';
import {
  BadRequestException,
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
  Injectable,
  NotAcceptableException,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';

interface UpdateArguments {
  // #region Object Properties

  cacheData: CacheData;
  license: SubmissionDTO<Partial<UtilizationResponseTermsDTO>>;
  update: UtilizationUpdateDTO;

  // #endregion Object Properties
}

@Injectable()
export class LicenseService {
  // #region Static Properties

  private static readonly FORM_PATH = 'license2/submission';

  // #endregion Static Properties

  // #region Constructors

  constructor(
    @InjectLogger(LicenseService, LIB_LICENSES)
    protected readonly logger: PinoLogger,
    private readonly formioSdkService: FormioSdkService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async getCache(licenseKey: string): Promise<CacheData> {
    return (
      (await this.cacheManager.get(licenseKey)) || {
        environments: [],
        apiKey: licenseKey,
        projects: [],
        formManagers: [],
      }
    );
  }

  public licenseFetch(id: string): Promise<LicenseDTO> {
    return this.fetch({
      url: LicenseService.FORM_PATH,
      filters: [
        {
          field: '_id',
          equals: id,
        },
      ],
    });
  }

  public licenseFetchByUser(user: UserDTO): Promise<LicenseDTO[]> {
    return this.fetch({
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

  public licenseIdFromReq(request: Request): string {
    return (
      request.headers['x-license-key'] ||
      request.params?.licenseKey ||
      request.body?.licenseKey
    );
  }

  public async monthlyUsage(
    arguments_: UpdateArguments,
  ): Promise<LicenseMonthlyUsageDTO> {
    let project = await this.getProject(arguments_);
    project = (await this.getStage(arguments_, project)) || project;

    return {
      emails: project.email,
      formRequests: project.formRequests,
      forms: project.forms.filter((index) => !index.disabled).length,
      pdfDownloads: project.pdfDownload,
      pdfs: project.pdf,
      submissionRequests: project.submissionRequest,
    };
  }

  public async utilizationUpdate(
    update: UtilizationUpdateDTO,
    license: LicenseDTO,
  ): Promise<UtilizationResponseDTO> {
    // Load auth associated with this specific license key
    const {
      licenseKeys,
      developmentLicense: developmentLicense,
    } = license.data;
    const auth = licenseKeys.find((key) => key.key === update.licenseKey);
    // * #1
    if (!auth) {
      throw new ForbiddenException('Invalid license key');
    }
    if (!this.isActive(license)) {
      throw new ForbiddenException(`License expired`);
    }
    // * #2
    if (update.type === LicenseScopes.apiServer) {
      return;
    }
    if (!auth.scope.includes(update.type)) {
      // Verify they have the scope
      throw new ForbiddenException(`Missing license key scope: ${update.type}`);
    }
    // * #3
    const cacheData: CacheData = await this.getCache(update.licenseKey);
    const arguments_ = {
      update,
      license,
      cacheData,
    };
    await this.processUpdate(arguments_);
    const keys: Record<string, LicenseKeyDTO> = {};
    licenseKeys.forEach((index) => (keys[index.key] = index));
    // ! Hash
    return {
      hash: '',
      ...update,
      used: await this.monthlyUsage(arguments_),
      licenseKey: update.licenseKey,
      projectId: update.projectId,
      licenseId: license._id,
      terms: license.data,
      type: update.type,
      devLicense: developmentLicense,
      keys,
    };
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async getApiServer(
    arguments_: UpdateArguments,
    returnDisabled = false,
  ): Promise<CacheEnvironmentDTO> {
    const { update, license } = arguments_;
    const cacheData =
      (await this.cacheManager.get<CacheEnvironmentDTO[]>(license._id)) || [];
    const environmentMap: Record<string, CacheEnvironmentDTO> = {};
    cacheData.forEach(
      (environment) => (environmentMap[environment.mongoHash] = environment),
    );
    // <Already Exists>
    const exists = environmentMap[update.formId];
    if (exists) {
      if (exists.disabled && !returnDisabled) {
        throw new ForbiddenException(`Environment is disabled`);
      }
      return exists;
    }
    // </Already Exists>
    // <Add New>
    const limit = license.data.apiServers || 0; // Breaking the trend, 0 is default.
    const current = cacheData.filter(
      (index) => !index.disabled && !!index.mongoHash,
    ).length;
    if (current >= limit) {
      throw new BadRequestException('At api server limit');
    }
    const environment: CacheEnvironmentDTO = {
      environmentId: update.environmentId,
      hostname: update.hostname,
      mongoHash: update.mongoHash,
    };
    cacheData.push(environment);
    await this.cacheManager.set(license._id, cacheData);
    return environment;
    // </Add New>
  }

  protected async getForm(
    arguments_: UpdateArguments,
    project: CacheProjectDTO,
    returnDisabled = false,
  ): Promise<CacheFormDTO> {
    const { update, license, cacheData } = arguments_;
    if (!update.formId) {
      return undefined;
    }
    const formMap: Record<string, CacheFormDTO> = {};
    project.forms.forEach((form) => (formMap[form.formId] = form));
    // <Already Exists>
    const exists = formMap[update.formId];
    if (exists) {
      if (exists.disabled && !returnDisabled) {
        throw new ForbiddenException(`Project is disabled ${update.stageId}`);
      }
      return exists;
    }
    // </Already Exists>
    // <Add New>
    const limit = license.data.projects || Number.POSITIVE_INFINITY;
    const current = cacheData.projects.filter((index) => !index.disabled)
      .length;
    if (current >= limit) {
      throw new BadRequestException('At project limit');
    }
    const form: CacheFormDTO = {
      formId: update.formId,
    };
    project.forms.push(form);
    await this.cacheManager.set(update.licenseKey, cacheData);
    return form;
    // </Add New>
  }

  protected async getProject(
    arguments_: UpdateArguments,
    returnDisabled = false,
  ): Promise<CacheProjectDTO> {
    const { cacheData, update, license } = arguments_;
    const projectMap: Record<string, CacheProjectDTO> = {};
    cacheData.projects.forEach(
      (project) => (projectMap[project.projectId] = project),
    );
    // <Already Exists>
    const exists = projectMap[update.projectId];
    if (exists) {
      if (exists.disabled && !returnDisabled) {
        throw new ForbiddenException(`Project is disabled ${update.stageId}`);
      }
      return exists;
    }
    // </Already Exists>
    // <Add New>
    const limit = license.data.projects || Number.POSITIVE_INFINITY;
    const current = cacheData.projects.filter((index) => !index.disabled)
      .length;
    if (current >= limit) {
      throw new BadRequestException('At project limit');
    }
    const project: CacheProjectDTO = {
      projectId: update.projectId,
    };
    cacheData.projects.push(project);
    await this.cacheManager.set(update.licenseKey, cacheData);
    return project;
    // </Add New>
  }

  protected async getStage(
    arguments_: UpdateArguments,
    project: CacheProjectDTO,
    returnDisabled = false,
  ): Promise<CacheProjectDTO> {
    const { cacheData, update, license } = arguments_;
    if (!update.stageId) {
      return undefined;
    }
    const stageMap: Record<string, CacheProjectDTO> = {};
    project.livestages.forEach((stage) => (stageMap[stage.stageId] = stage));
    // <Already Exists>
    const exists = stageMap[update.stageId];
    if (exists) {
      if (exists.disabled && !returnDisabled) {
        throw new ForbiddenException(`Stage is disabled ${update.stageId}`);
      }
      return exists;
    }
    // </Already Exists>
    // <Add New>
    const limit = license.data.livestages || Number.POSITIVE_INFINITY;
    const current = project.livestages.filter((index) => !index.disabled)
      .length;
    if (current >= limit) {
      throw new BadRequestException('At stage limit');
    }
    const stage: CacheProjectDTO = {
      projectId: update.projectId,
    };
    project.livestages.push(stage);
    await this.cacheManager.set(update.licenseKey, cacheData);
    return stage;
    // </Add New>
  }

  protected isActive(license: LicenseDTO): boolean {
    const started =
      !license.data.startDate || dayjs().isAfter(dayjs(license.data.startDate));
    const ended =
      license.data.endDate && dayjs().isAfter(dayjs(license.data.startDate));
    return started && !ended;
  }

  // TODO: Refactor method to simplify
  // eslint-disable-next-line radar/cognitive-complexity
  protected async processUpdate(
    arguments_: UpdateArguments,
  ): Promise<CacheData> {
    const { cacheData, update, license } = arguments_;
    const licenseData = new Map(Object.entries(license.data));

    switch (update.type) {
      case LicenseScopes.apiServer:
        await this.getApiServer(arguments_);
        return cacheData;
      case LicenseScopes.pdfServer:
        // TODO: PDF Server
        throw new NotImplementedException('FIXME');
    }
    let project = await this.getProject(arguments_);
    project = (await this.getStage(arguments_, project)) || project;
    await this.getForm(arguments_, project);
    // * Items tracked monthly
    // Submission counts and such
    const pluralType = `${update.type}s`;
    if (Object.values(LicenseTrackedMonthlyScopes).includes(update.type)) {
      if (!project || project.disabled) {
        throw new BadRequestException('Bad project');
      }
      project[update.type] = project[update.type] || 0;
      const limit = licenseData.get(pluralType);
      if (project[update.type] > limit) {
        throw new NotAcceptableException('Exceeded monthly limit');
      }
      project[update.type]++;
      return this.cacheManager.set(update.licenseKey, cacheData);
    }
    // * Items tracked against license
    // project, tenants, formManager
    if (Object.values(LicenseTrackedLicenseScopes).includes(update.type)) {
      // Nothing to do, was basically validated by getProject(), or the switch up top
      return cacheData;
    }
    if (Object.values(LicenseTrackedProjectScopes).includes(update.type)) {
      let limit;
      switch (update.type) {
        case LicenseScopes.pdf:
          project[update.type] = project[update.type] || 0;
          limit = licenseData.get(pluralType);
          if (project[update.type] > limit) {
            throw new NotAcceptableException('Exceeded project limit');
          }
          project[update.type]++;
          return this.cacheManager.set(update.licenseKey, cacheData);
        case LicenseScopes.form:
        case LicenseScopes.stage:
          return cacheData;
      }
      this.logger.warn(`Missed a spot`);
      return cacheData;
    }
    // Not tracked against projects
    // Not tracked against license
    // Not tracked monthly
    this.logger.error(`Missing logic for scope: ${update.type}`);
    throw new NotImplementedException();
    return cacheData;
  }

  // #endregion Protected Methods

  // #region Private Methods

  private fetch<T>(arguments_: FetchWith) {
    return this.formioSdkService.fetch<T>({
      baseUrl: this.configService.get(LICENSE_SERVER),
      ...arguments_,
    });
  }

  // #endregion Private Methods
}
