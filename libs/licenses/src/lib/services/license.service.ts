import {
  CacheData,
  CacheEnvironmentDTO,
  CacheFormDTO,
  CacheProjectDTO,
  LicenseDTO,
  LicenseKeyDTO,
  LicenseMonthlyUsageDTO,
  LicenseScopes,
  LicenseTrackedLicenseScopes,
  LicenseTrackedMonthlyScopes,
  LicenseTrackedProjectScopes,
  SubmissionDTO,
  UserDTO,
  UtilizationResponseDTO,
  UtilizationResponseTermsDTO,
  UtilizationUpdateDTO,
} from '@automagical/contracts';
import { FetchWith, FormioSdkService } from '@automagical/formio-sdk';
import { env, Logger } from '@automagical/logger';
import {
  BadRequestException,
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
  Injectable,
  NotAcceptableException,
  NotImplementedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';
import { Request } from 'express';

type UpdateArgs = {
  update: UtilizationUpdateDTO;
  license: SubmissionDTO<Partial<UtilizationResponseTermsDTO>>;
  /**
   * ! This object will be frequently mutated by methods here
   *
   * * This is on purpose, maybe try to keep the variable local to the file
   */
  cacheData: CacheData;
};

@Injectable()
export class LicenseService {
  // #region Static Properties

  private static readonly FORM_PATH = 'license2/submission';

  // #endregion Static Properties

  // #region Object Properties

  private readonly logger = Logger(LicenseService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly formioSdkService: FormioSdkService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // #endregion Constructors

  // #region Public Methods

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

  public async monthlyUsage(args: UpdateArgs): Promise<LicenseMonthlyUsageDTO> {
    let project = await this.getProject(args);
    project = (await this.getStage(args, project)) || project;

    return {
      emails: project.email,
      formRequests: project.formRequests,
      forms: project.forms.filter((i) => !i.disabled).length,
      pdfDownloads: project.pdfDownload,
      pdfs: project.pdf,
      submissionRequests: project.submissionRequest,
    };
  }

  /**
   * General API Server is sending a utilizatino update handler
   *
   * 1. Verify license is actually active
   * 2. Remap any needed scopes (stages)
   * 3. For remote licenses, verify form utilization also
   * 4. If item is tracked against project, verify project utilization
   * 5. Verify count if utilization is tracked as total
   */
  public async utilizationUpdate(
    update: UtilizationUpdateDTO,
    license: LicenseDTO,
  ): Promise<UtilizationResponseDTO> {
    // Load auth associated with this specific license key
    // Not all keys may be scoped for the full capabilities of the license
    const { licenseKeys, developmentLicense: devLicense } = license.data;
    const auth = licenseKeys.find((key) => key.key === update.licenseKey);
    // * #1
    if (!auth) {
      throw new ForbiddenException('Invalid license key');
    }
    if (!this.isActive(license)) {
      throw new ForbiddenException(`License expired`);
    }
    // * #2
    if (update.type === LicenseScopes.stage) {
      // post authoring mode: all stages are livestages now
      update.type = LicenseScopes.livestage;
    }
    if (update.type === LicenseScopes.apiServer) {
      return;
    }
    if (!auth.scope.includes(update.type)) {
      // Verify they have the scope
      throw new ForbiddenException(`Missing license key scope: ${update.type}`);
    }
    // * #3
    const cacheData: CacheData = (await this.cacheManager.get(
      update.licenseKey,
    )) || {
      environments: [],
      apiKey: update.licenseKey,
      projects: [],
      formManagers: [],
    };
    const args = {
      update,
      license,
      cacheData,
    };
    await this.processUpdate(args);
    const keys: Record<string, LicenseKeyDTO> = {};
    licenseKeys.forEach((i) => (keys[i.key] = i));
    // ! Hash
    return {
      hash: '',
      ...update,
      used: await this.monthlyUsage(args),
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

  protected async getApiServer(
    args: UpdateArgs,
    returnDisabled = false,
  ): Promise<CacheEnvironmentDTO> {
    const { update, license } = args;
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
    const current = cacheData.filter((i) => !i.disabled && !!i.mongoHash)
      .length;
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
    args: UpdateArgs,
    project: CacheProjectDTO,
    returnDisabled = false,
  ): Promise<CacheFormDTO> {
    const { update, license, cacheData } = args;
    if (!update.formId) {
      return null;
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
    const limit = license.data.projects || Infinity;
    const current = cacheData.projects.filter((i) => !i.disabled).length;
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
    args: UpdateArgs,
    returnDisabled = false,
  ): Promise<CacheProjectDTO> {
    const { cacheData, update, license } = args;
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
    const limit = license.data.projects || Infinity;
    const current = cacheData.projects.filter((i) => !i.disabled).length;
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
    args: UpdateArgs,
    project: CacheProjectDTO,
    returnDisabled = false,
  ): Promise<CacheProjectDTO> {
    const { cacheData, update, license } = args;
    if (!update.stageId) {
      return null;
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
    const limit = license.data.livestages || Infinity;
    const current = project.livestages.filter((i) => !i.disabled).length;
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

  protected isActive(license: LicenseDTO) {
    const started =
      !license.data.startDate || dayjs().isAfter(dayjs(license.data.startDate));
    const ended =
      license.data.endDate && dayjs().isAfter(dayjs(license.data.startDate));
    return started && !ended;
  }

  protected async processUpdate(args: UpdateArgs) {
    const { cacheData, update, license } = args;
    switch (update.type) {
      case LicenseScopes.apiServer:
        return this.getApiServer(args);
      case LicenseScopes.pdfServer:
        // TODO: PDF Server
        throw new NotImplementedException('FIXME');
    }
    let project = await this.getProject(args);
    project = (await this.getStage(args, project)) || project;
    const form = await this.getForm(args, project);
    // * Items tracked monthly
    // Submission counts and such
    if (Object.values(LicenseTrackedMonthlyScopes).includes(update.type)) {
      if (!project || project.disabled) {
        throw new BadRequestException('Bad project');
      }
      project[update.type] = project[update.type] || 0;
      const limit = license.data[`${update.type}s`];
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
      switch (update.type) {
        case LicenseScopes.pdf:
          project[update.type] = project[update.type] || 0;
          const limit = license.data[`${update.type}s`];
          if (project[update.type] > limit) {
            throw new NotAcceptableException('Exceeded project limit');
          }
          project[update.type]++;
          return this.cacheManager.set(update.licenseKey, cacheData);
        case LicenseScopes.form:
        case LicenseScopes.stage:
        case LicenseScopes.livestage:
          return cacheData;
      }
      this.logger.alert(`Missed a spot`);
      return cacheData;
    }
    // Not tracked against projects
    // Not tracked against license
    // Not tracked monthly
    this.logger.crit(`Missing logic for scope: ${update.type}`);
    throw new NotImplementedException();
    return cacheData;
  }

  // #endregion Protected Methods

  // #region Private Methods

  private fetch<T>(args: FetchWith) {
    return this.formioSdkService.fetch<T>({
      baseUrl: process.env.FORMIO_SDK_LICENSE_SERVER_base_url,
      ...args,
    });
  }

  // #endregion Private Methods
}
