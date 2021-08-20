import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { PortainerFetchService } from './portainer-fetch.service';

@Injectable()
export class PortainerCustomTemplatesService {
  // #region Constructors

  constructor(private readonly fetchService: PortainerFetchService) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async getFile(id: string): Promise<unknown> {
    return await this.fetchService.fetch({
      url: `/custom_templates/${id}/file`,
    });
  }

  @Trace()
  public async inspect(id: string): Promise<unknown> {
    return await this.fetchService.fetch({
      url: `/custom_templates/${id}`,
    });
  }

  @Trace()
  public async list(): Promise<unknown> {
    return await this.fetchService.fetch({
      url: `/custom_templates`,
    });
  }

  @Trace()
  public async remove(id: string): Promise<unknown> {
    return await this.fetchService.fetch({
      method: 'delete',
      url: `/custom_templates/${id}`,
    });
  }

  // #endregion Public Methods
}
