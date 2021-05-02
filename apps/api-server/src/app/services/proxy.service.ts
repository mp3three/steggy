import { APP_API_SERVER } from '@automagical/contracts/constants';
import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { FetchService } from '@automagical/fetch';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { TenantSettings } from '../../typings';

@Injectable()
export class ProxyService {
  // #region Constructors

  constructor(
    @InjectLogger(ProxyService, APP_API_SERVER)
    private readonly logger: PinoLogger,
    private readonly fetchService: FetchService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async getProject(
    tenant: ProjectDTO<TenantSettings>,
  ): Promise<ProjectDTO & { proxy: true }> {
    const project = await this.fetchService.fetch<ProjectDTO>({
      headers: {
        'x-token': tenant.settings.proxy.apiKey,
      },
      url: tenant.settings.proxy.url,
      rawUrl: true,
    });
    if (!project._id) {
      throw new InternalServerErrorException('Invalid response');
    }
    return {
      ...project,
      title: tenant.title,
      description: tenant.description,
      name: tenant.name,
      owner: tenant.owner,
      _id: tenant._id,
      project: undefined,
      proxy: true,
    };
  }

  // #endregion Public Methods
}
