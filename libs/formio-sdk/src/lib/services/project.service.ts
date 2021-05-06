import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { ProjectDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import {
  FetchWith,
  HTTP_Methods,
  Identifier,
  TemporaryAuthToken as TemporaryAuthToken,
} from '../../typings';
import { FormioSdkService } from './formio-sdk.service';
type CommonID = Identifier | string;

@Injectable()
export class ProjectService {
  // #region Constructors

  constructor(
    @InjectLogger(ProjectService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    private readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Create a new project
   *
   * To create a stage, add "project":"{{projectId}}" to the body
   */
  @Trace()
  public async create(
    arguments_: FetchWith<{ body: ProjectDTO }>,
  ): Promise<ProjectDTO> {
    // TODO: Templates
    return await this.formioSdkService.fetch<ProjectDTO>({
      method: HTTP_Methods.POST,
      url: '/project',
      ...arguments_,
    });
  }

  /**
   * Generate a new project admin. You'll need this for special actions like pulling reports
   */
  @Trace()
  public async createAdmin(
    arguments_: FetchWith<{
      project: CommonID;
      email: string;
      password: string;
    }>,
  ): Promise<UserDTO> {
    return await this.formioSdkService.fetch({
      data: {
        email: arguments_.email,
        password: arguments_.password,
      },
      method: HTTP_Methods.POST,
      url: this.formioSdkService.projectUrl(arguments_.project, '/admin'),
      ...arguments_,
    });
  }

  /**
   * Purge a project 💣
   */
  @Trace()
  public async delete(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      method: HTTP_Methods.DELETE,
      url: this.formioSdkService.projectUrl(arguments_.project),
      ...arguments_,
    });
  }

  /**
   * Retrieve a more generic version of the project definition
   */
  @Trace()
  public async export(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      url: this.formioSdkService.projectUrl(arguments_.project, '/export'),
      ...arguments_,
    });
  }

  /**
   * Get project data. Does not include resources
   */
  @Trace()
  public async get(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<ProjectDTO> {
    return await this.formioSdkService.fetch<ProjectDTO>({
      url: this.formioSdkService.projectUrl(arguments_.project),
      ...arguments_,
    });
  }

  /**
   * List all projects your user has access to
   */
  @Trace()
  public async list(arguments_: FetchWith = {}): Promise<ProjectDTO[]> {
    return await this.formioSdkService.fetch<ProjectDTO[]>({
      url: '/project',
      ...arguments_,
    });
  }

  /**
   * @FIXME: What is this? Unknown on the Dto also
   */
  @Trace()
  public async projectAccessInfo(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      url: this.formioSdkService.projectUrl(arguments_.project, '/access'),
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
    return await this.formioSdkService.fetch<TemporaryAuthToken>({
      headers: {
        'x-allow': header,
      },
      url: this.formioSdkService.projectUrl(arguments_.project, '/token'),
    });
  }

  /**
   * Create a new project role
   */
  @Trace()
  public async roleCreate(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      method: HTTP_Methods.POST,
      url: this.formioSdkService.projectUrl(arguments_.project, '/role'),
      ...arguments_,
    });
  }

  /**
   * List all the roles in the project
   */
  @Trace()
  public async roleList(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch<ProjectDTO[]>({
      url: this.formioSdkService.projectUrl(arguments_.project, '/role'),
      ...arguments_,
    });
  }

  /**
   * Update a role in the project
   */
  @Trace()
  public async roleUpdate(
    arguments_: FetchWith<{
      project: CommonID;
      role: CommonID;
      body: Record<'title' | 'description', string>;
    }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      method: HTTP_Methods.PUT,
      url: this.formioSdkService.projectUrl(
        arguments_.project,
        `/role/${this.formioSdkService.id(arguments_.role)}`,
      ),
      ...arguments_,
    });
  }

  /**
   * Import a resource/form template
   *
   * TODO: Template DTO
   */
  @Trace()
  public async templateImport(
    arguments_: FetchWith<{
      project: CommonID;
      template: Record<string, unknown>;
    }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      data: {
        template: arguments_.template,
      },
      method: HTTP_Methods.POST,
      url: this.formioSdkService.projectUrl(arguments_.project, '/import'),
    });
  }

  /**
   * Update a project
   *
   * TODO: Send back modifications, or whole object
   */
  @Trace()
  public async update(
    arguments_: FetchWith<{ project: Identifier; body: ProjectDTO }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch<ProjectDTO>({
      body: arguments_.body,
      method: HTTP_Methods.PUT,
      url: this.formioSdkService.projectUrl(arguments_.project),
      ...arguments_,
    });
  }

  // #endregion Public Methods
}
