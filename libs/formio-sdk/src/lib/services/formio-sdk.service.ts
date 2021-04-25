import { FormioSDKConfig } from '@automagical/config';
import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import {
  ProjectDTO,
  UserDataDTO,
  UserDTO,
} from '@automagical/contracts/formio-sdk';
import { FetchService } from '@automagical/fetch';
import { InjectLogger } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Response } from 'node-fetch';
import {
  FetchWith,
  HTTP_Methods,
  Identifier,
  TempAuthToken,
} from '../../typings';

type CommonID = Identifier | string;
export type FetchError = { status: number; message: string };

/**
 * This service is the primary entry point for interacting with the API Server
 * It contains methods for interacting with projects, and high level portal interactions
 *
 * For interacting with resources / forms: Resource Service
 * For interacting with submmissions: Submission Service
 * For more nuanced interactions, view ../tools
 */
@Injectable()
export class FormioSdkService {
  // #region Object Properties

  public config: FormioSDKConfig;
  public jwtToken: string;
  public userDto: UserDTO = null;

  protected readonly ALL_PROJECTS: Record<string, ProjectDTO> = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(FormioSdkService, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    private readonly fetchService: FetchService,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async fetch<T>(args: FetchWith): Promise<T> {
    return await this.fetchHandler<T>(
      this.fetchService.fetch<T>({
        baseUrl: this.config.PORTAL_BASE_URL,
        apiKey: this.config.API_KEY,
        token: this.jwtToken,
        ...args,
      }),
    );
  }

  /**
   * Simple resolver, works great for non-project-y things.
   *
   * Those sometimes prefer using names
   */
  public id(id: CommonID): string {
    // Shorthand type resolver
    return typeof id === 'string' ? id : id._id;
  }

  /**
   * Called by Nest - https://docs.nestjs.com/fundamentals/lifecycle-events
   *
   * Sets up a usable jwtToken before the application finishes bootstrapping
   */
  private async onModuleInit(): Promise<void> {
    this.config = this.configService.get('libs.formio-sdk');

    if (this.config.AUTH?.password) {
      this.logger.info(`Attempting to log in`);
      await this.userLogin();
    }
  }

  /**
   * @FIXME: What is this? Unknown on the Dto also
   */
  public async projectAccessInfo(
    args: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    this.logger.trace(args, 'projectAccessInfo');
    return await this.fetch({
      url: this.projectUrl(args.project, '/access'),
      ...args,
    });
  }

  /**
   * Retrieve an admin token for a project. Some calls require admin level access. Emits warning when called
   *
   * Default functionality pulls credentials from config
   *
   * @see projectCreateAdmin
   */
  public async projectAdminLogin(
    args: FetchWith<{ name: CommonID }>,
  ): Promise<UserDTO> {
    this.logger.warn(`getAdminToken`);
    return await this.userLogin({
      name: args.name,
      type: 'admin',
      ...args,
    });
  }

  /**
   * If you need to authenticate any user for a specific endpoint ONLY, then the best method is to use a Temporary Token.
   * This allows you to restrict access for a specific path for a short period of time.
   * This is ideal if you need to create a "download" url that a person can use to download a file.
   * You can also use this method for "authentication" integration where the token is safe to include in the URL of the integration system.
   *
   * @param project The project to host this token
   * @param allowList A mapping of routes you want to expose
   * @example
   * ```json
   * {
   *   GET: ['/cookie/jar'],
   *   POST: ['/mouth],
   * }
   * ```
   */
  public async projectAuthToken(
    args: FetchWith<{
      project: CommonID;
      allowList?: Map<HTTP_Methods, string[]>;
    }>,
  ): Promise<TempAuthToken> {
    this.logger.trace(args, 'projectAuthToken');
    let header;
    if (args.allowList) {
      const parts: string[] = [];
      args.allowList.forEach((value, key) =>
        parts.push(`${key}:${value.join(',')}`),
      );
      header = parts.join(',');
    }
    return await this.fetch<TempAuthToken>({
      url: this.projectUrl(args.project, '/token'),
      headers: {
        'x-allow': header,
      },
    });
  }

  /**
   * Create a new project
   *
   * To create a stage, add "project":"{{projectId}}" to the body
   */
  public async projectCreate(
    args: FetchWith<{ body: ProjectDTO }>,
  ): Promise<ProjectDTO> {
    this.logger.trace(args, 'projectCreate');
    // TODO: Templates
    return await this.fetch<ProjectDTO>({
      url: '/project',
      method: HTTP_Methods.POST,
      ...args,
    });
  }

  /**
   * Generate a new project admin. You'll need this for special actions like pulling reports
   */
  public async projectCreateAdmin(
    args: FetchWith<{
      project: CommonID;
      email: string;
      password: string;
    }>,
  ): Promise<UserDTO> {
    this.logger.trace(args, 'projectCreateAdmin');
    return await this.fetch({
      url: this.projectUrl(args.project, '/admin'),
      method: HTTP_Methods.POST,
      data: {
        email: args.email,
        password: args.password,
      },
      ...args,
    });
  }

  /**
   * Purge a project 💣
   */
  public async projectDelete(
    args: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    this.logger.trace(args, `projectDelete`);
    return await this.fetch({
      url: this.projectUrl(args.project),
      method: HTTP_Methods.DELETE,
      ...args,
    });
  }

  /**
   * Retrieve a more generic version of the project definition
   */
  public async projectExport(
    args: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    this.logger.trace(args, 'projectExport');
    return await this.fetch({
      url: this.projectUrl(args.project, '/export'),
      ...args,
    });
  }

  /**
   * Get project data. Does not include resources
   */
  public async projectGet(
    args: FetchWith<{ project: CommonID }>,
  ): Promise<ProjectDTO> {
    this.logger.trace(args, `projectGet`);
    return await this.fetch<ProjectDTO>({
      url: this.projectUrl(args.project),
      ...args,
    });
  }

  /**
   * List all projects your user has access to
   */
  public async projectList(args: FetchWith = {}): Promise<ProjectDTO[]> {
    this.logger.info(args, `projectList`);
    return await this.fetch<ProjectDTO[]>({
      url: '/project',
      ...args,
    });
  }

  /**
   * Create a new project role
   */
  public async projectRoleCreate(
    args: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    this.logger.info(args, `projectRoleCreate`);
    return await this.fetch({
      url: this.projectUrl(args.project, '/role'),
      method: HTTP_Methods.POST,
      ...args,
    });
  }

  /**
   * List all the roles in the project
   */
  public async projectRoleList(
    args: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    this.logger.info(args, `projectRoleList`);
    return await this.fetch<ProjectDTO[]>({
      url: this.projectUrl(args.project, '/role'),
      ...args,
    });
  }

  /**
   * Modify a role in the project
   */
  public async projectRoleUpdate(
    args: FetchWith<{
      project: CommonID;
      role: CommonID;
      body: Record<'title' | 'description', string>;
    }>,
  ): Promise<unknown> {
    this.logger.info(args, `projectRoleUpdate`);
    return await this.fetch({
      url: this.projectUrl(args.project, `/role/${this.id(args.role)}`),
      method: HTTP_Methods.PUT,
      ...args,
    });
  }

  /**
   * Import a resource/form template
   *
   * TODO: Template DTO
   */
  public async projectTemplateImport(
    args: FetchWith<{
      project: CommonID;
      template: Record<string, unknown>;
    }>,
  ): Promise<unknown> {
    return await this.fetch({
      url: this.projectUrl(args.project, '/import'),
      method: HTTP_Methods.POST,
      data: {
        template: args.template,
      },
    });
  }

  /**
   * Modify a project
   *
   * TODO: Send back modifications, or whole object
   */
  public async projectUpdate(
    args: FetchWith<{ project: Identifier; body: ProjectDTO }>,
  ): Promise<unknown> {
    this.logger.debug(`projectUpdate`);
    return await this.fetch<ProjectDTO>({
      url: this.projectUrl(args.project),
      method: HTTP_Methods.PUT,
      body: args.body,
      ...args,
    });
  }

  /**
   * Create a new user (register)
   */
  public async userCreate(args: FetchWith<UserDataDTO>): Promise<UserDTO> {
    this.logger.debug(`userCreate`);
    return await this.fetch<UserDTO>({
      url: this.projectUrl(this.config.BASE_PROJECT, '/user/register'),
      method: HTTP_Methods.POST,
      data: {
        email: args.email,
        password: args.password,
        name: args.name,
      },
      ...args,
    });
  }

  /**
   * Retrieve userdata (or verify token)
   */
  public async userFetch(args: FetchWith = {}): Promise<unknown> {
    this.logger.debug(`userRefresh`);
    this.userDto = await this.fetch({
      url: this.projectUrl(null, '/current'),
      ...args,
    });
    return this.userDto;
  }

  /**
   * Retrieve a JWT, store it in this.jwtToken
   */
  public async userLogin(
    args: FetchWith<{
      name?: CommonID;
      type?: 'user' | 'admin';
    }> = {},
  ): Promise<UserDTO> {
    this.logger.debug(`userLogin`);
    args.name = args.name || this.config.BASE_PROJECT;
    args.type = args.type || 'user';
    const res = (await this.fetch({
      url: this.projectUrl(args.name, `/${args.type}/login`),
      method: HTTP_Methods.POST,
      process: false,
      data: {
        ...this.config.AUTH,
      },
      ...args,
    })) as Response;
    this.jwtToken = res.headers.get('x-jwt-token');
    this.userDto = await res.json();
    return this.userDto;
  }

  /**
   * Tear down a user session.
   *
   * @FIXME: Does this actually do anything on the server side?
   */
  public async userLogout(args: FetchWith = {}): Promise<unknown> {
    this.logger.debug(`userLogout`);
    if (!this.jwtToken) {
      return;
    }
    await this.fetch({
      url: this.projectUrl(null, '/logout'),
      ...args,
    });
    this.jwtToken = null;
  }

  // #endregion Public Methods

  // #region Private Methods

  private async fetchHandler<T>(res: T | Promise<T>): Promise<T> {
    // De-promise
    res = await res;
    if (typeof res !== 'object') {
      return res;
    }
    // TODO clean up this statement 🗑🔥
    if (((res as unknown) as { name: string }).name === 'ValidationError') {
      // This is likely a code error in the calling service
      this.logger.error(JSON.stringify(res, null, 2));
      throw new InternalServerErrorException();
    }
    return res;
  }

  /**
   * 🤖 Advanced AI generates string from url parts
   */
  private projectUrl(
    args: CommonID = this.config.BASE_PROJECT,
    path = '',
  ): string {
    if (typeof args === 'string' || args.name) {
      return `/${typeof args === 'string' ? args : args.name}${path}`;
    }
    if (args.name) {
      return `/${args.name}${path}`;
    }
    if (args._id) {
      return `/project/${args._id}${path}`;
    }
    // yolo?
    return `/formio${path}`;
  }

  // #endregion Private Methods
}
