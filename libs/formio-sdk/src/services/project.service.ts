import {
  CrudOptions,
  ProjectCRUD,
  ProjectSupport,
} from '@automagical/contracts';
import { BASE_PROJECT, PROJECT_URL } from '@automagical/contracts/config';
import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { ProjectDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import {
  FetchWith,
  HTTP_METHODS,
  ResultControlDTO,
  TemporaryAuthToken,
} from '@automagical/contracts/utilities';
import { InjectLogger, Trace } from '@automagical/utilities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

import { CommonID, FormioSdkService } from './formio-sdk.service';

@Injectable()
export class ProjectService implements ProjectCRUD, ProjectSupport {
  // #region Constructors

  constructor(
    @InjectLogger(ProjectService, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    @Inject(forwardRef(() => FormioSdkService))
    protected readonly formioSdkService: FormioSdkService,
    protected readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async access({ auth }: CrudOptions): Promise<ProjectDTO> {
    return await this.formioSdkService.fetch({
      ...auth,
      url: `/project/access`,
    });
  }

  @Trace()
  public async adminCreate(
    body: Record<string, unknown>,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      body,
      method: HTTP_METHODS.post,
      url: `/project/admin`,
    });
  }

  @Trace()
  public async adminLogin(
    body: Record<string, unknown>,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      body,
      method: HTTP_METHODS.post,
      url: `/project/admin/login`,
    });
  }

  @Trace()
  public async available(
    body: Record<string, unknown>,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      body,
      method: HTTP_METHODS.post,
      url: `/project/available`,
    });
  }

  @Trace()
  public async create(
    project: ProjectDTO,
    { auth }: CrudOptions,
  ): Promise<ProjectDTO> {
    return await this.formioSdkService.fetch({
      ...auth,
      body: project,
      method: HTTP_METHODS.post,
      url: this.url(''),
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
    { auth }: CrudOptions,
  ): Promise<UserDTO> {
    return await this.formioSdkService.fetch({
      ...auth,
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
    { auth }: CrudOptions,
  ): Promise<boolean> {
    return await this.formioSdkService.fetch({
      ...auth,
      method: HTTP_METHODS.delete,
      url: this.url(project),
    });
  }

  @Trace()
  public async deploy(
    body: Record<string, unknown>,
    { auth, project }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      body,
      method: HTTP_METHODS.post,
      url: this.url(project, '/deploy'),
    });
  }

  /**
   * Retrieve a more generic version of the project definition
   */
  @Trace()
  public async export(
    project: ProjectDTO,
    { auth }: CrudOptions,
  ): Promise<Record<string, unknown>> {
    return await this.formioSdkService.fetch({
      url: this.formioSdkService.projectUrl(project, '/export'),
      ...(auth || {}),
    });
  }

  @Trace()
  public async findById(
    project: string,
    { auth, control }: CrudOptions,
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
    { auth, control }: CrudOptions,
  ): Promise<ProjectDTO> {
    if (this.configService.get(PROJECT_URL)) {
      return await this.formioSdkService.fetch({
        ...auth,
        control,
        url: `/`,
      });
    }
    return await this.formioSdkService.fetch({
      ...auth,
      control,
      url: `/${name}`,
    });
  }

  @Trace()
  public async findMany(
    query: ResultControlDTO,
    { auth }: CrudOptions,
  ): Promise<ProjectDTO[]> {
    return await await this.formioSdkService.fetch({
      ...auth,
      control: query,
      url: this.url(''),
    });
  }

  @Trace()
  public async getCurrentTag(
    project: ProjectDTO,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      url: this.url(project, '/tag/current'),
    });
  }

  @Trace()
  public async import(
    body: Record<string, unknown>,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      body,
      method: HTTP_METHODS.post,
      url: `/project/import`,
    });
  }

  @Trace()
  public async portalCheck(
    body: Record<string, unknown>,
    { auth, project }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      body,
      method: HTTP_METHODS.post,
      url: this.url(project, '/portal-check'),
    });
  }

  /**
   * @FIXME: What is this? Unknown on the Dto also
   */
  @Trace()
  public async projectAccessInfo(
    arguments_: FetchWith<{ project: CommonID }>,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
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

  @Trace()
  public async report(
    body: Record<string, unknown>,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      body,
      method: HTTP_METHODS.post,
      url: `/project/report`,
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

  @Trace()
  public async sqlconnector(
    project: ProjectDTO,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      url: this.url(project, '/sqlconnector'),
    });
  }

  @Trace()
  public async swagger(
    project: ProjectDTO,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      url: this.url(project, '/spec.json'),
    });
  }

  @Trace()
  public async tempAuthToken(
    project: ProjectDTO,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      ...auth,
      url: this.url(project, '/token'),
    });
  }

  @Trace()
  public async update(
    body: ProjectDTO,
    { auth, project }: CrudOptions,
  ): Promise<ProjectDTO> {
    return await this.formioSdkService.fetch<ProjectDTO>({
      ...auth,
      body,
      method: HTTP_METHODS.put,
      url: this.url(project),
    });
  }

  @Trace()
  public async upgradeProject(
    body: Record<string, unknown>,
    { auth }: CrudOptions,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch<ProjectDTO>({
      ...auth,
      body,
      method: HTTP_METHODS.post,
      url: '/project/upgrade',
    });
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async onModuleInit(): Promise<void> {
    const projectName = this.configService.get<string>(BASE_PROJECT);
    if (projectName) {
      this.formioSdkService.BASE_PROJECT = await this.findByName(
        projectName,
        {},
      );
    }
  }

  protected url(project: ProjectDTO | string, append = ''): string {
    return `/project/${
      typeof project === 'string' ? project : project._id
    }${append}`;
  }

  // #endregion Protected Methods
}
