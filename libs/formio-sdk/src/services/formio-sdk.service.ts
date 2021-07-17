import {
  API_KEY,
  AUTH_EMAIL,
  AUTH_PASSWORD,
  BASE_PROJECT,
  PORTAL_BASE_URL,
  PROJECT_URL,
} from '@automagical/contracts/config';
import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import type { FetchWith } from '@automagical/contracts/fetch';
import { HTTP_METHODS, Identifier } from '@automagical/contracts/fetch';
import { ProjectDTO, UserDataDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { FetchService, InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Response } from 'node-fetch';

export type CommonID = Identifier | string;
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

  /**
   * Use this project as a default for CRUD requests
   *
   * Overrides can still be provided via method args
   */
  public BASE_PROJECT: ProjectDTO;
  /**
   * If provided a set of login credentials, this will store the jwt token that can be used to auth followup requests
   */
  public jwtToken: string;
  /**
   * If provided a set of login credentials, this will store the userdata
   */
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
  public async fetch<T>(fetchWith: FetchWith): Promise<T> {
    const parameters = {
      apiKey: this.configService.get(API_KEY),
      baseUrl:
        this.configService.get(PROJECT_URL) ||
        this.configService.get(PORTAL_BASE_URL),
      ...fetchWith,
    };
    const result = this.fetchService.fetch<T>(parameters);
    return await this.fetchHandler<T>(result);
  }

  /**
   * Retrieve an admin token for a project. Some calls require admin level access. Emits warning when called
   *
   * Default functionality pulls credentials from config
   *
   * @see projectCreateAdmin
   */
  @Trace()
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

  /**
   * Create a new user (register)
   */
  @Trace()
  public async userCreate(
    arguments_: FetchWith<UserDataDTO>,
  ): Promise<UserDTO> {
    return await this.fetch<UserDTO>({
      data: {
        email: arguments_.email,
        name: arguments_.name,
        password: arguments_.password,
      },
      method: HTTP_METHODS.post,
      url: this.projectUrl(
        this.configService.get(BASE_PROJECT),
        '/user/register',
      ),
      ...arguments_,
    });
  }

  /**
   * Retrieve userdata (or verify token)
   */
  @Trace()
  public async userFetch(arguments_: FetchWith = {}): Promise<UserDTO> {
    this.userDto = await this.fetch({
      url: this.projectUrl(this.configService.get(BASE_PROJECT), '/current'),
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
    arguments_.name ??= this.configService.get(BASE_PROJECT);
    arguments_.type ??= 'user';
    const response = (await this.fetch({
      data: {
        email: this.configService.get(AUTH_EMAIL),
        password: this.configService.get(AUTH_PASSWORD),
      },
      method: HTTP_METHODS.post,
      process: false,
      url: this.projectUrl(arguments_.name, `/${arguments_.type}/login`),
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
      url: this.projectUrl(this.configService.get(BASE_PROJECT), '/logout'),
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
   * 🤖 Advanced AI generates string from url parts
   */
  public projectUrl(project?: CommonID, path = ''): string {
    if (!project && this.configService.get(PROJECT_URL)) {
      return path;
    }
    project ??= this.configService.get(BASE_PROJECT);
    if (!project) {
      return path;
    }
    if (typeof project === 'string' || project.name) {
      return `/${typeof project === 'string' ? project : project.name}${path}`;
    }
    if (project.name) {
      return `/${project.name}${path}`;
    }
    if (project._id) {
      return `/project/${project._id}${path}`;
    }
    // 🤖 Advanced AI gives up
    throw new InternalServerErrorException(
      'Cannot generate url from provided project',
    );
  }

  // #endregion Public Methods

  // #region Private Methods

  /**
   * no trace
   */
  private async fetchHandler<T>(response: T | Promise<T>): Promise<T> {
    // De-promise
    response = await response;
    if (typeof response !== 'object') {
      return response;
    }
    // TODO clean up this statement 🗑🔥
    if ((response as unknown as { name: string }).name === 'ValidationError') {
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
    if (this.configService.get(AUTH_PASSWORD)) {
      this.logger.info(`Attempting to log in`);
      await this.userLogin();
    }
  }

  // #endregion Private Methods
}
