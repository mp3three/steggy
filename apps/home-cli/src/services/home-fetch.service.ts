import { FetchService, FetchWith, InjectConfig } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { ADMIN_KEY, CONTROLLER_API } from '../config';

@Injectable()
export class HomeFetchService {
  constructor(
    private readonly fetchService: FetchService,
    @InjectConfig(ADMIN_KEY) private readonly adminKey: string,
    @InjectConfig(CONTROLLER_API) readonly url: string,
  ) {
    fetchService.BASE_URL = url;
  }

  public fetch<OUTPUT, BODY extends unknown = unknown>(
    fetch: FetchWith<Record<never, string>, BODY>,
  ): Promise<OUTPUT> {
    fetch.adminKey = this.adminKey;
    return this.fetchService.fetch<OUTPUT>(fetch);
  }

  public getUrl(url: string): string {
    return this.fetchService.fetchCreateUrl({ url });
  }
}
