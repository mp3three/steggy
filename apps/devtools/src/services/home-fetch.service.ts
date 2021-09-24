import { FetchService, FetchWith, InjectConfig } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { CONTROLLER_API } from '../config';

@Injectable()
export class HomeFetchService {
  constructor(
    private readonly fetchService: FetchService,
    @InjectConfig(CONTROLLER_API) readonly url: string,
  ) {
    fetchService.BASE_URL = url;
  }

  public fetch<T>(fetch: FetchWith): Promise<T> {
    return this.fetchService.fetch<T>(fetch);
  }
}
