import { FetchService, InjectConfig } from '@steggy/boilerplate';
import { FetchWith, is, sleep, START } from '@steggy/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

import { ADMIN_KEY, CONTROLLER_API } from '../config';

const MAX_TRY = 5;
const PREFIX = '/api';
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
    if (fetch.url.slice(START, PREFIX.length) !== PREFIX) {
      fetch.url = `${PREFIX}${fetch.url}`;
    }
    const result = await this.fetchService.fetch<OUTPUT>(fetch);
    if (is.string(result) || result === '') {
      counter++;
      console.log(chalk.bold` {blue !} Could not connect to controller`);
      await sleep();
      return await this.fetch(fetch, counter);
    }
    // if (this.isError(result)) {
    //   throw result as Error;
    // }
    return result;
  }

  public getUrl(url: string): string {
    return this.fetchService.fetchCreateUrl({ url });
  }

  private isError(output: unknown): output is Error {
    return !is.undefined((output as { error: string }).error);
  }
}
