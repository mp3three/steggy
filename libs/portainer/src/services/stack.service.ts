import { FetchWith } from '@automagical/utilities';
import { Trace } from '@automagical/utilities';

import { CustomTemplateDTO, StackDTO } from '../contracts';
import { PortainerFetchService } from './portainer-fetch.service';

export class StackService {
  constructor(private readonly fetchService: PortainerFetchService) {}

  @Trace()
  public async create(): Promise<CustomTemplateDTO> {
    return await this.fetchService.fetch({
      method: 'post',
      url: `/stacks`,
    });
  }

  @Trace()
  public async list({
    filters,
    ...fetchWith
  }: FetchWith<{ filters?: string }> = {}): Promise<StackDTO[]> {
    return await this.fetchService.fetch({
      params: {
        filters,
      },
      url: `/stacks`,
      ...fetchWith,
    });
  }
}
