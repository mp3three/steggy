import { iLogger, Logger } from '@automagical/logger';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import fetch, { BodyInit, RequestInit, Response } from 'node-fetch';
import { ResourceService } from '.';
import { ProjectDTO, UserDataDTO, UserDTO } from './dto';
import {
  FetchWith,
  Filters,
  HTTP_Methods,
  Identifier,
  SDKConfig,
  TempAuthToken,
} from './typings';

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

  public PORTAL_BASE = 'formio';
  public jwtToken: string;
  public userDto: UserDTO = null;

  protected readonly ALL_PROJECTS: Record<string, ProjectDTO> = {};

  private readonly logger = Logger(FormioSdkService);

  // #endregion Object Properties

  // #region Constructors

  /**
   * Do not use constructor for bootstrapping work
   * https://docs.nestjs.com/fundamentals/lifecycle-events
   */
  constructor(
    @Inject('SDKConfig') public readonly config: SDKConfig,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * > ⚠️⚠️ See README @ libs/formio-sdk/README.md ⚠️⚠️
   *
   * ## TL;DR
   *
   * Big wrapper around node-fetch, does a lot of magic to convert args into a format node-fetch can work with.
   * Hopefully with the side effect of making for more simpler reading end code, and keeping the complexity inside the lib.
   * The intent is to have a most layman understandable interface here.
   *
   * All requests from this code base are routed through this function so they can take advantage of the automatic url resolution.
   * The post-processing steps are optional, but will be expanded upon in the future.
   *
   * ### Feature Goals
   *
   * - Exporting all requests as curl request
   * - Exporting as postman compatible (convert a quick script into e2e tests?)
   */
  public async fetch<T>(args: FetchWith): Promise<T> {
    const url: string = await this.fetchCreateUrl(args);
    const requestInit = await this.fetchCreateMeta(args);
    this.logger.info(`${requestInit.method} ${url}`);
    if (!url.includes('/login')) {
      // This log will probably contain user credentials
      this.logger.debug(requestInit);
    }
    try {
      const res = await fetch(url, requestInit);
      return this.fetchHandleResponse(args, res);
    } catch (err) {
      this.logger.error(err);
      return null;
    }
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
    if (this.config.LOGIN_PASSWORD) {
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
   */
  public async projectTemplateImport(
    args: FetchWith<{
      project: CommonID;
      // FIXME: Dto
      template: Record<string, unknown>;
    }>,
  ) {
    this.logger.debug(`projectTemplateImport`, args);
    this.logger.alert(`FIXME: fill in DTO projectTemplateImport`);
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
    const { LOGIN_EMAIL: email, LOGIN_PASSWORD: password } = this.config;
    const res = (await this.fetch({
      url: this.projectUrl(args.name, `/${args.type}/login`),
      method: HTTP_Methods.POST,
      process: false,
      data: {
        email,
        password,
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

  /**
   * Mostly a UI tool, but if you find a use 🤷‍♂️
   */
  public async userRefresh(args: FetchWith = {}) {
    this.logger.debug(`userRefresh`, args);
    this.userDto = await this.fetch({
      url: this.projectUrl(null, '/current'),
      ...args,
    });
    return this.userDto;
  }

  // #endregion Public Methods

  // #region Protected Methods

  /**
   * Resolve Filters and query params object into a query string.
   *
   * In case of collision, provided params take priority.
   */
  protected buildFilterString(
    args: FetchWith<{
      filters?: Readonly<Filters[]>;
      params?: Record<string, string>;
    }>,
  ) {
    const out: Partial<Record<string, string>> = {};
    (args.filters || []).forEach((filter) => {
      Object.keys(filter).forEach((type: keyof Filters) => {
        let value: string | RegExp | dayjs.Dayjs = null;
        switch (type) {
          case 'select':
          case 'sort':
          case 'in':
          case 'nin':
            if (typeof (filter[type] as unknown[])?.join !== 'undefined') {
              value = (filter[type] as unknown[]).join(',');
              break;
            }
        }
        if (
          typeof filter[type] !== 'string' &&
          (filter[type] as dayjs.Dayjs).toISOString
        ) {
          value = (filter[type] as dayjs.Dayjs).toISOString();
        }
        value = filter[type].toString();
        switch (type) {
          case 'select':
          case 'skip':
          case 'limit':
          case 'sort':
            out[type] = value;
            return;
          case 'field':
            return;
          case 'equals':
            out[filter.field] = value;
            return;
          default:
            out[`${filter.field}__${type}`] = value;
        }
      });
    });
    return new URLSearchParams({ ...out, ...(args.params || {}) }).toString();
  }

  /**
   * Pre-request logic for fetch()
   *
   * Should return: headers, body, method
   */
  protected async fetchCreateMeta(args: FetchWith): Promise<RequestInit> {
    const body =
      typeof args.body === 'object' || typeof args.data === 'object'
        ? JSON.stringify({
            data: args.data ? { ...args.data } : undefined,
            ...(args.data ? {} : (args.body as Record<string, unknown>)),
          })
        : args.body;
    const headers = {};
    let method = args.method || 'GET';
    if (body) {
      // Override
      method = args.method === 'GET' ? 'POST' : args.method;
      // Header is needed
      headers['Content-Type'] = 'application/json';
    }

    const token = args.token || this.jwtToken;
    const apiKey = args.apiKey || this.config.API_KEY;
    if (token) {
      headers['x-jwt-token'] = token;
    }
    if (apiKey) {
      headers['x-token'] = apiKey;
    }
    return {
      headers,
      body: body as BodyInit,
      method,
    };
  }

  /**
   * Resolve url provided in args into a full path w/ domain
   */
  protected fetchCreateUrl(args: FetchWith) {
    const baseUrl = args.baseUrl || this.config.PORTAL_BASE_URL;
    let url = args.rawUrl ? args.url : `${baseUrl}${args.url}`;
    if (args.tempAuthToken) {
      args.params = args.params || {};
      args.params.token = (args.tempAuthToken as TempAuthToken).key;
    }
    if (args.filters || args.params) {
      url = `${url}?${this.buildFilterString(args)}`;
    }
    return url;
  }

  /**
   * Post processing function for fetch()
   */
  protected async fetchHandleResponse(args: FetchWith, res: Response) {
    if (args.process === false) {
      return res;
    }
    const text = await res.text();
    this.logger.debug(text);
    if (!['{', '['].includes(text.charAt(0))) {
      // Personally, I think all responses should always be JSON. Fight me
      // This type of "is the string really an error?" is aggravating, not convenient

      if (!['OK'].includes(text)) {
        // It's probably a coding error error, and not something a user did.
        // Will try to keep the array up to date if any other edge cases pop up
        this.logger.alert(`Invalid API Response`, text);
      }
      return text;
    }
    return JSON.parse(text);
  }

  // #endregion Protected Methods

  // #region Private Methods

  /**
   * 🤖 Advanced AI generates url parts
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
    return `/formio${path}`;
  }

  // #endregion Private Methods
}
