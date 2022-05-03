import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { CrudOptions } from '@steggy/server';
import { FetchWith, HTTP_METHODS, ResultControlDTO } from '@steggy/utilities';

import { ProjectDTO } from '../contracts';
import { FormioFetchService } from './formio-fetch.service';

export type TemporaryAuthToken = {
  key: string;
  token?: string;
};

@Injectable()
export class ProjectService {
  constructor(
    protected readonly logger: AutoLogService,
    protected readonly formioSdkService: FormioFetchService,
  ) {}

  /**
   * Retrieve a more generic version of the project definition
   */

  public async export(
    arguments_: FetchWith<{ project: ProjectDTO | string }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      url: `/export`,
      ...arguments_,
    });
  }

  public async findMany(
    query: ResultControlDTO,
    { auth }: CrudOptions,
  ): Promise<ProjectDTO[]> {
    return await await this.formioSdkService.fetch({
      ...auth,
      control: query,
      url: `/`,
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
  public async projectAuthToken(
    arguments_: FetchWith<{
      allowList?: Map<HTTP_METHODS, string[]>;
      project: ProjectDTO | string;
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
      headers: { 'x-allow': header },
      url: `/token`,
    });
  }

  /**
   * Create a new project role
   */

  public async roleCreate(
    arguments_: FetchWith<{ project: ProjectDTO | string }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      method: HTTP_METHODS.post,
      url: `/role`,
      ...arguments_,
    });
  }

  /**
   * List all the roles in the project
   */

  public async roleList(
    arguments_: FetchWith<{ project: ProjectDTO | string }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch<ProjectDTO[]>({
      url: `/role`,
      ...arguments_,
    });
  }

  /**
   * Update a role in the project
   */
  public async roleUpdate(
    arguments_: FetchWith<{
      body: Record<'title' | 'description', string>;
      project: ProjectDTO | string;
      role: string;
    }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      method: HTTP_METHODS.put,
      url: `/role/${arguments_.role}`,
      ...arguments_,
    });
  }

  public async templateImport(
    arguments_: FetchWith<{
      project: ProjectDTO | string;
      template: Record<string, unknown>;
    }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      body: { data: { template: arguments_.template } },
      method: HTTP_METHODS.post,
      url: `/import`,
    });
  }

  public async update(
    source: ProjectDTO,
    { auth }: CrudOptions,
  ): Promise<ProjectDTO> {
    const result = await this.formioSdkService.fetch<ProjectDTO>({
      ...auth,
      body: source,
      method: HTTP_METHODS.put,
      url: `/`,
    });
    return result;
  }
}
