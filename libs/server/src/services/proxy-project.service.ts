import { CrudOptions, ProjectCRUD } from '@automagical/contracts';
import { PORTAL_ADMIN_KEY, PROJECT_KEYS } from '@automagical/contracts/config';
import { LIB_SERVER } from '@automagical/contracts/constants';
import type { ResultControlDTO } from '@automagical/contracts/fetch';
import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { ProjectService } from '@automagical/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { CronJob } from 'cron';
import { PinoLogger } from 'nestjs-pino';

/**
 * # Proxy Project Service
 *
 * The ProxyProjectService can be substituted in for [ProjectService]{@link ProjectService} (formio-sdk) for more restrictive and cache friendly project resolution.
 * This service will load a list of projects from config, and will preserve those projects in cache (periodically updating from source).
 *
 * Find by name operations will run against the cache in addition to find by id.
 * Updates will be passed through to the hub, and the local cache will be immediately updated.
 * Delete and create operations are explicitly unsupported by this class, your request needs to be performed from the central hub.
 *
 * ## Current Issues
 *
 * ### Limited support for result control operations
 *
 * Operations such as select (limit the fields being returned) are currently unsupported.
 * Typically this work is done by the database server, however there is no database server in the mix here.
 *
 * ### Server ADMIN_KEY required
 *
 * As of `7.1.6`, the form.io API Server does NOT return project settings when requesting via api key.
 * This unfortunately prevents a lot of the submission server logic from working properly (email being the biggest item).
 * As a work around, this class currently requires access to the value of the **ADMIN_KEY** environment variable on the central hub.
 *
 * This key is ONLY used with operations performed by this class, which is still further confined to the projects defined in config.
 */
@Injectable()
export class ProxyProjectService implements ProjectCRUD {
  // #region Static Properties

  private static PROJECT_LIST = new Set<string>();
  private static SCHEDULER_CLAIMED = false;

  // #endregion Static Properties

  // #region Constructors

  constructor(
    @InjectLogger(ProxyProjectService, LIB_SERVER)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly projectService: ProjectService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(): Promise<never> {
    throw new NotAcceptableException('Project proxy does not allow creates');
  }

  @Trace()
  public async delete(): Promise<never> {
    throw new NotAcceptableException('Project proxy does not allow deletes');
  }

  @Trace()
  public async findById(
    project: string,
    options: CrudOptions,
  ): Promise<ProjectDTO> {
    options.auth ??= {};
    const projects =
      this.configService.get<Record<string, string>>(PROJECT_KEYS);
    const map = new Map(Object.entries(projects));
    if (!map.has(project)) {
      throw new InternalServerErrorException(`Invalid projectId`);
    }
    options.auth.apiKey ??= map.get(project);
    const result = await this.projectService.findById(
      project,
      this.addAdminKey(options),
    );
    await this.cacheManager.set(result._id, result, {
      ttl: 60 * 15,
    });
    return result;
  }

  @Trace()
  public async findByName(
    name: string,
    options: CrudOptions,
  ): Promise<ProjectDTO> {
    const { control } = options;
    control.filters ??= new Set();
    control.filters.add({
      field: 'name',
      value: name,
    });
    control.limit = 1;
    let out: ProjectDTO;
    const list = [...ProxyProjectService.PROJECT_LIST];
    await Promise.all(
      list.map(async (projectId) => {
        const project = await this.cacheManager.get<ProjectDTO>(projectId);
        if (project?.name === name) {
          out = project;
        }
      }),
    );
    if (!out) {
      this.logger.error({ name }, `findByName failed`);
    }
    options ??= {};
    if (control?.select) {
      this.logger.warn(
        `Project project does support select operations in findByName`,
      );
    }
    return out;
  }

  @Trace()
  public async findMany(
    control: ResultControlDTO,
    options: CrudOptions,
  ): Promise<ProjectDTO[]> {
    // Technically... this returns everything and ignores the query
    // Fortunately, this isn't really a useful route for the submission server anyways
    if (control) {
      this.logger.warn(
        `findMany: results are uncontrolled (unsupported by proxy)`,
      );
    }
    return await Promise.all(
      [...ProxyProjectService.PROJECT_LIST.values()].map(async (projectId) => {
        return await this.findById(projectId, options);
      }),
    );
  }

  @Trace()
  public async update(
    source: ProjectDTO,
    options: CrudOptions,
  ): Promise<ProjectDTO> {
    const result = await this.projectService.update(
      source,
      this.addAdminKey(options),
    );
    this.cacheManager.set(result._id, result);
    return result;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected async onModuleInit(): Promise<void> {
    if (ProxyProjectService.SCHEDULER_CLAIMED) {
      return;
    }
    ProxyProjectService.SCHEDULER_CLAIMED = true;
    const job = new CronJob(CronExpression.EVERY_MINUTE, async () => {
      await this.refreshProjectCache();
    });
    this.schedulerRegistry.addCronJob(
      'ProxyProjectService.refreshProjectCache',
      job,
    );
    job.start();
    await this.refreshProjectCache(true);
  }

  @Trace()
  protected async refreshProjectCache(initialLoad = false): Promise<void> {
    const projects = this.configService.get<Record<string, string>>(
      PROJECT_KEYS,
      {},
    );
    const map = new Map(Object.entries(projects));
    await Promise.all(
      Object.keys(projects).map(async (projectId) => {
        const project = await this.findById(projectId, {
          auth: { apiKey: map.get(projectId) },
        });
        if (initialLoad) {
          ProxyProjectService.PROJECT_LIST.add(projectId);
          this.logger.info(
            { settings: project.settings },
            `Loaded project: (${project.name}) ${project.title}`,
          );
        }
      }),
    );
  }

  // #endregion Protected Methods

  // #region Private Methods

  /**
   * As of **2021-07-01** -
   * There is still an outstanding bug in `7.1.x` that prevents the server from returning project settings when requested via api key
   *
   * The work around is to replace any/all auth credentials with the portal admin key to make the request.
   * This is intended to be temporary as a feature, until a new minimum version for `7.x` can be identified.
   * It is only active when the `PORTAL_ADMIN_KEY` is set and the same on both sides.
   * No workflow should exist in the submission server that would let it request a project not defined in the config.
   */
  private addAdminKey(options: CrudOptions): CrudOptions {
    const adminKey = this.configService.get(PORTAL_ADMIN_KEY);
    if (!adminKey) {
      return options;
    }
    return {
      ...options,
      auth: {
        adminKey,
      },
    };
  }

  // #endregion Private Methods
}
