import { ProjectCRUD } from '@automagical/contracts';
import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import type { FetchAuth, FetchWith } from '@automagical/contracts/fetch';
import {
  HTTP_METHODS,
  ResultControlDTO,
  TemporaryAuthToken,
} from '@automagical/contracts/fetch';
import { ProjectDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { CommonID, FormioSdkService } from './formio-sdk.service';

@Injectable()
export class ProjectService implements ProjectCRUD {
  // #region Constructors

  constructor(
    @InjectLogger(ProjectService, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    protected readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(
    project: ProjectDTO,
    auth: FetchAuth = {},
  ): Promise<ProjectDTO> {
    return await this.formioSdkService.fetch({
      body: project,
      method: HTTP_METHODS.post,
      url: this.url(''),
      ...auth,
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
      method: HTTP_METHODS.post,
      url: this.formioSdkService.projectUrl(arguments_.project, '/admin'),
      ...arguments_,
    });
  }

  @Trace()
  public async delete(
    project: ProjectDTO | string,
    auth: FetchAuth = {},
  ): Promise<boolean> {
    return await this.formioSdkService.fetch({
      method: HTTP_METHODS.delete,
      url: this.url(project),
      ...auth,
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

  @Trace()
  public async findById(
    project: string,
    control?: ResultControlDTO,
    auth: FetchAuth = {},
  ): Promise<ProjectDTO> {
    return await this.formioSdkService.fetch({
      control,
      url: this.url(project),
      ...auth,
    });
  }

  @Trace()
  public async findByName(
    name: string,
    control: ResultControlDTO = {},
    auth: FetchAuth = {},
  ): Promise<ProjectDTO> {
    control.filters ??= new Set();
    control.filters.add({
      field: 'name',
      value: name,
    });
    const results = await this.findMany(control, auth);
    return results[0];
  }

  @Trace()
  public async findMany(
    query: ResultControlDTO,
    auth: FetchAuth = {},
  ): Promise<ProjectDTO[]> {
    return await await this.formioSdkService.fetch({
      control: query,
      url: this.url(''),
      ...auth,
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
      allowList?: Map<HTTP_METHODS, string[]>;
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
      method: HTTP_METHODS.post,
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
      method: HTTP_METHODS.put,
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
      method: HTTP_METHODS.post,
      url: this.formioSdkService.projectUrl(arguments_.project, '/import'),
    });
  }

  @Trace()
  public async update(
    source: ProjectDTO | string,
    update: Omit<Partial<ProjectDTO>, '_id' | 'created'>,
    auth: FetchAuth = {},
  ): Promise<ProjectDTO> {
    const result = await this.formioSdkService.fetch<ProjectDTO>({
      body: update,
      method: HTTP_METHODS.put,
      url: this.url(source),
      ...auth,
    });
    return result;
  }

  public async hardDelete(): Promise<never> {
    throw new NotImplementedException();
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected url(project: ProjectDTO | string): string {
    return `/project/${typeof project === 'string' ? project : project._id}`;
  }

  // #endregion Protected Methods
}
