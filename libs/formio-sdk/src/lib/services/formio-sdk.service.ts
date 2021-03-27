import { Fetch } from '@automagical/fetch';
import { iLogger, Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import { Response } from 'node-fetch';
import { ProjectDTO, UserDataDTO, UserDTO } from '@automagical/contracts';
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
  // #region Static Properties

  public static logger: iLogger;

  // #endregion Static Properties

  // #region Object Properties

  public PORTAL_BASE = process.env.FORMIO_SDK_PORTAL_BASE_PROJECT;
  public jwtToken: string;
  public userDto: UserDTO = null;

  protected readonly ALL_PROJECTS: Record<string, ProjectDTO> = {};

  private readonly logger = Logger(FormioSdkService);

  // #endregion Object Properties

  // #region Public Methods

  public fetch<T>(args: FetchWith) {
    return Fetch.fetch<T>({
      baseUrl: process.env.FORMIO_SDK_PORTAL_BASE_URL,
      apiKey: process.env.FORMIO_SDK_API_KEY,
      token: this.jwtToken,
      ...args,
    });
  }

  /**
   * Simple resolver, works great for non-project-y things.
   *
   * Those sometimes prefer using names
   */
  public id(id: CommonID) {
    // Shorthand type resolver
    return typeof id === 'string' ? id : id._id;
  }

  /**
   * Called by Nest - https://docs.nestjs.com/fundamentals/lifecycle-events
   *
   * Sets up a usable jwtToken before the application finishes bootstrapping
   */
  public async onModuleInit() {
    if (process.env.FORMIO_SDK_LOGIN_PASSWORD) {
      this.logger.info(`Attempting to log in`);
      await this.userLogin();
    }
  }

  /**
   * @FIXME: What is this? Unknown on the Dto also
   */
  public async projectAccessInfo(args: FetchWith<{ project: CommonID }>) {
    this.logger.debug('projectAccessInfo', args);
    return this.fetch({
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
  public async projectAdminLogin(args: FetchWith<{ name: CommonID }>) {
    this.logger.warning(`getAdminToken`, args);
    return this.userLogin({
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
      allowList?: Record<HTTP_Methods, string[]>;
    }>,
  ) {
    this.logger.debug('projectAuthToken', args);
    let header;
    if (args.allowList) {
      header = Object.keys(args.allowList)
        .map((key) => `${key}:${args.allowList[key].join(',')}`)
        .join(',');
    }
    return this.fetch<TempAuthToken>({
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
  public projectCreate(args: FetchWith<{ body: ProjectDTO }>) {
    this.logger.debug('projectCreate', args);
    // TODO: Templates
    return this.fetch<ProjectDTO | FetchError>({
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
  ) {
    this.logger.debug('projectCreateAdmin', args);
    return this.fetch({
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
  public async projectDelete(args: FetchWith<{ project: CommonID }>) {
    this.logger.debug(`projectDelete`, args);
    return this.fetch({
      url: this.projectUrl(args.project),
      method: HTTP_Methods.DELETE,
      ...args,
    });
  }

  /**
   * Retrieve a more generic version of the project definition
   */
  public async projectExport(args: FetchWith<{ project: CommonID }>) {
    this.logger.debug('projectExport', args);
    return this.fetch({
      url: this.projectUrl(args.project, '/export'),
      ...args,
    });
  }

  /**
   * Get project data. Does not include resources
   */
  public async projectGet(args: FetchWith<{ project: CommonID }>) {
    this.logger.debug(`projectGet`, args);
    return this.fetch<ProjectDTO>({
      url: this.projectUrl(args.project),
      ...args,
    });
  }

  /**
   * List all projects your user has access to
   */
  public async projectList(args: FetchWith = {}) {
    this.logger.debug(`projectList`, args);
    return this.fetch<ProjectDTO[]>({
      url: '/project',
      ...args,
    });
  }

  /**
   * Create a new project role
   */
  public async projectRoleCreate(args: FetchWith<{ project: CommonID }>) {
    this.logger.debug(`projectRoleCreate`, args);
    return this.fetch({
      url: this.projectUrl(args.project, '/role'),
      method: HTTP_Methods.POST,
      ...args,
    });
  }

  /**
   * List all the roles in the project
   */
  public async projectRoleList(args: FetchWith<{ project: CommonID }>) {
    this.logger.debug(`projectRoleList`, args);
    return this.fetch<ProjectDTO[]>({
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
  ) {
    this.logger.debug(`projectRoleUpdate`, args);
    return this.fetch({
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
  ) {
    return this.fetch({
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
  ) {
    this.logger.debug(`projectUpdate`, args);
    return this.fetch<ProjectDTO>({
      url: this.projectUrl(args.project),
      method: HTTP_Methods.PUT,
      body: args.body,
      ...args,
    });
  }

  /**
   * Create a new user (register)
   */
  public userCreate(args: FetchWith<UserDataDTO>) {
    this.logger.debug(`userCreate`, args);
    return this.fetch<UserDTO>({
      url: this.projectUrl(null, '/user/register'),
      method: HTTP_Methods.POST,
      data: {
        email: args.email,
        password: args.password,
      },
      ...args,
    });
  }

  /**
   * Retrieve userdata (or verify token)
   */
  public async userFetch(args: FetchWith = {}) {
    this.logger.debug(`userRefresh`, args);
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
  ) {
    this.logger.debug(`userLogin`, args);
    args.name = args.name || this.PORTAL_BASE;
    args.type = args.type || 'user';
    const res = (await this.fetch({
      url: this.projectUrl(args.name, `/${args.type}/login`),
      method: HTTP_Methods.POST,
      process: false,
      data: {
        email: process.env.FORMIO_SDK_AUTH_user,
        password: process.env.FORMIO_SDK_AUTH_password,
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
  public async userLogout(args: FetchWith = {}) {
    this.logger.debug(`userLogout`, args);
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

  /**
   * 🤖 Advanced AI generates string from url parts
   */
  private projectUrl(args: CommonID = this.PORTAL_BASE, path = ''): string {
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
