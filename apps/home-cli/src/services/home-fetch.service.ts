import {
  FetchService,
  FetchWith,
  InjectConfig,
  sleep,
  START,
} from '@for-science/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

import { ADMIN_KEY, CONTROLLER_API } from '../config';

const MAX_TRY = 5;
@Injectable()
export class HomeFetchService {
  constructor(
    private readonly fetchService: FetchService,
    @InjectConfig(ADMIN_KEY) private readonly adminKey: string,
    @InjectConfig(CONTROLLER_API) readonly url: string,
  ) {
    fetchService.BASE_URL = url;
  }

  public async fetch<OUTPUT, BODY extends unknown = unknown>(
    fetch: FetchWith<Record<never, string>, BODY>,
    counter = START,
  ): Promise<OUTPUT> {
    if (counter > MAX_TRY) {
      throw new Error(`Could not connect to controller`);
    }
    fetch.adminKey = this.adminKey;
    const result = await this.fetchService.fetch<OUTPUT>(fetch);
    if (typeof result === 'undefined' || result === '') {
      counter++;
      console.log(chalk.bold` {blue !} Could not connect to controller`);
      await sleep();
      return await this.fetch(fetch, counter);
    }
    return result;
  }

  public getUrl(url: string): string {
    return this.fetchService.fetchCreateUrl({ url });
  }
}
