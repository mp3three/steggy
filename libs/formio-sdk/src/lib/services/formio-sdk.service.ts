import { FormioSDKConfig } from '@automagical/config';
import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import {
  ProjectDTO,
  UserDataDTO,
  UserDTO,
} from '@automagical/contracts/formio-sdk';
import { FetchService } from '@automagical/fetch';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Response } from 'node-fetch';
import {
  FetchWith,
  HTTP_Methods,
  Identifier,
  TemporaryAuthToken as TemporaryAuthToken,
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
  public userDto: UserDTO;

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

  @Trace()
  public async fetch<T>(arguments_: FetchWith): Promise<T> {
    return await this.fetchHandler<T>(
      this.fetchService.fetch<T>({
        baseUrl: this.config.PORTAL_BASE_URL,
        apiKey: this.config.API_KEY,
        token: this.jwtToken,
        ...arguments_,
      }),
    );
  }

  /**
   * @FIXME: What is this? Unknown on the Dto also
   */
  @Trace()
  public async projectAccessInfo(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    return await this.fetch({
      url: this.projectUrl(arguments_.project, '/access'),
      ...arguments_,
    });
  }

  /**
   * If you need to authenticate any user for a specific endpoint, then the best method is to use a Temporary Token.
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
  @Trace()
  public async projectAuthToken(
    arguments_: FetchWith<{
      project: CommonID;
      allowList?: Map<HTTP_Methods, string[]>;
    }>,
  ): Promise<TemporaryAuthToken> {
    let header;
    if (arguments_.allowList) {
      const parts: string[] = [];
      arguments_.allowList.forEach((value, key) =>
        parts.push(`${key}:${value.join(',')}`),
      );
      header = parts.join(',');
    }
    return await this.fetch<TemporaryAuthToken>({
      url: this.projectUrl(arguments_.project, '/token'),
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
  @Trace()
  public async projectCreate(
    arguments_: FetchWith<{ body: ProjectDTO }>,
  ): Promise<ProjectDTO> {
    // TODO: Templates
    return await this.fetch<ProjectDTO>({
      url: '/project',
      method: HTTP_Methods.POST,
      ...arguments_,
    });
  }

  /**
   * Generate a new project admin. You'll need this for special actions like pulling reports
   */
  @Trace()
  public async projectCreateAdmin(
    arguments_: FetchWith<{
      project: CommonID;
      email: string;
      password: string;
    }>,
  ): Promise<UserDTO> {
    return await this.fetch({
      url: this.projectUrl(arguments_.project, '/admin'),
      method: HTTP_Methods.POST,
      data: {
        email: arguments_.email,
        password: arguments_.password,
      },
      ...arguments_,
    });
  }

  /**
   * Purge a project 💣
   */
  @Trace()
  public async projectDelete(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    return await this.fetch({
      url: this.projectUrl(arguments_.project),
      method: HTTP_Methods.DELETE,
      ...arguments_,
    });
  }

  /**
   * Retrieve a more generic version of the project definition
   */
  @Trace()
  public async projectExport(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    return await this.fetch({
      url: this.projectUrl(arguments_.project, '/export'),
      ...arguments_,
    });
  }

  /**
   * Get project data. Does not include resources
   */
  @Trace()
  public async projectGet(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<ProjectDTO> {
    return await this.fetch<ProjectDTO>({
      url: this.projectUrl(arguments_.project),
      ...arguments_,
    });
  }

  /**
   * List all projects your user has access to
   */
  @Trace()
  public async projectList(arguments_: FetchWith = {}): Promise<ProjectDTO[]> {
    return await this.fetch<ProjectDTO[]>({
      url: '/project',
      ...arguments_,
    });
  }

  /**
   * Create a new project role
   */
  @Trace()
  public async projectRoleCreate(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    return await this.fetch({
      url: this.projectUrl(arguments_.project, '/role'),
      method: HTTP_Methods.POST,
      ...arguments_,
    });
  }

  /**
   * List all the roles in the project
   */
  @Trace()
  public async projectRoleList(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    return await this.fetch<ProjectDTO[]>({
      url: this.projectUrl(arguments_.project, '/role'),
      ...arguments_,
    });
  }

  /**
   * Update a role in the project
   */
  @Trace()
  public async projectRoleUpdate(
    arguments_: FetchWith<{
      project: CommonID;
      role: CommonID;
      body: Record<'title' | 'description', string>;
    }>,
  ): Promise<unknown> {
    return await this.fetch({
      url: this.projectUrl(
        arguments_.project,
        `/role/${this.id(arguments_.role)}`,
      ),
      method: HTTP_Methods.PUT,
      ...arguments_,
    });
  }

  /**
   * Import a resource/form template
   *
   * TODO: Template DTO
   */
  @Trace()
  public async projectTemplateImport(
    arguments_: FetchWith<{
      project: CommonID;
      template: Record<string, unknown>;
    }>,
  ): Promise<unknown> {
    return await this.fetch({
      url: this.projectUrl(arguments_.project, '/import'),
      method: HTTP_Methods.POST,
      data: {
        template: arguments_.template,
      },
    });
  }

  /**
   * Update a project
   *
   * TODO: Send back modifications, or whole object
   */
  @Trace()
  public async projectUpdate(
    arguments_: FetchWith<{ project: Identifier; body: ProjectDTO }>,
  ): Promise<unknown> {
    return await this.fetch<ProjectDTO>({
      url: this.projectUrl(arguments_.project),
      method: HTTP_Methods.PUT,
      body: arguments_.body,
      ...arguments_,
    });
  }

  /**
   * Create a new user (register)
   */
  @Trace()
  public async userCreate(
    arguments_: FetchWith<UserDataDTO>,
  ): Promise<UserDTO> {
    return await this.fetch<UserDTO>({
      url: this.projectUrl(this.config.BASE_PROJECT, '/user/register'),
      method: HTTP_Methods.POST,
      data: {
        email: arguments_.email,
        password: arguments_.password,
        name: arguments_.name,
      },
      ...arguments_,
    });
  }

  /**
   * Retrieve userdata (or verify token)
   */
  @Trace()
  public async userFetch(arguments_: FetchWith = {}): Promise<unknown> {
    this.userDto = await this.fetch({
      url: this.projectUrl(this.config.BASE_PROJECT, '/current'),
      ...arguments_,
    });
    return this.userDto;
  }

  /**
   * Retrieve a JWT, store it in this.jwtToken
   */
  @Trace()
  public async userLogin(
    arguments_: FetchWith<{
      name?: CommonID;
      type?: 'user' | 'admin';
    }> = {},
  ): Promise<UserDTO> {
    arguments_.name = arguments_.name || this.config.BASE_PROJECT;
    arguments_.type = arguments_.type || 'user';
    const response = (await this.fetch({
      url: this.projectUrl(arguments_.name, `/${arguments_.type}/login`),
      method: HTTP_Methods.POST,
      process: false,
      data: {
        ...this.config.AUTH,
      },
      ...arguments_,
    })) as Response;
    this.jwtToken = response.headers.get('x-jwt-token');
    this.userDto = await response.json();
    return this.userDto;
  }

  /**
   * Tear down a user session.
   *
   * @FIXME: Does this actually do anything on the server side?
   */
  @Trace()
  public async userLogout(arguments_: FetchWith = {}): Promise<unknown> {
    if (!this.jwtToken) {
      return;
    }
    await this.fetch({
      url: this.projectUrl(this.config.BASE_PROJECT, '/logout'),
      ...arguments_,
    });
    this.jwtToken = undefined;
  }

  /**
   * Simple resolver
   */
  public id(id: CommonID): string {
    // Shorthand type resolver
    return typeof id === 'string' ? id : id._id;
  }

  /**
   * Retrieve an admin token for a project. Some calls require admin level access. Emits warning when called
   *
   * Default functionality pulls credentials from config
   *
   * @see projectCreateAdmin
   */
  public async projectAdminLogin(
    arguments_: FetchWith<{ name: CommonID }>,
  ): Promise<UserDTO> {
    this.logger.warn(`getAdminToken`);
    return await this.userLogin({
      name: arguments_.name,
      type: 'admin',
      ...arguments_,
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private async fetchHandler<T>(response: T | Promise<T>): Promise<T> {
    // De-promise
    response = await response;
    if (typeof response !== 'object') {
      return response;
    }
    // TODO clean up this statement 🗑🔥
    if (
      ((response as unknown) as { name: string }).name === 'ValidationError'
    ) {
      this.logger.error(JSON.stringify(response, undefined, 2));
      throw new InternalServerErrorException();
    }
    return response;
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
   * 🤖 Advanced AI generates string from url parts
   */
  private projectUrl(
    project: CommonID = this.config.BASE_PROJECT,
    path = '',
  ): string {
    if (typeof project === 'string' || project.name) {
      return `/${typeof project === 'string' ? project : project.name}${path}`;
    }
    if (project.name) {
      return `/${project.name}${path}`;
    }
    if (project._id) {
      return `/project/${project._id}${path}`;
    }
    // yolo?
    return `/formio${path}`;
  }

  // #endregion Private Methods
}
