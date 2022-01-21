import { Injectable, Scope } from '@nestjs/common';
import Bottleneck from 'bottleneck';
import { createWriteStream } from 'fs';
import fetch from 'node-fetch';

import { FetchArguments } from '../../contracts';
import { AutoLogService } from '../auto-log.service';
import { BaseFetchService } from './base-fetch.service';

const DEFAULT_TRUNCATE_LENGTH = 200;
@Injectable({ scope: Scope.TRANSIENT })
export class FetchService extends BaseFetchService {
  constructor(protected override readonly logger: AutoLogService) {
    super();
  }

  public override TRUNCATE_LENGTH = DEFAULT_TRUNCATE_LENGTH;

  private limiter: Bottleneck;

  public bottleneck(options: Bottleneck.ConstructorOptions): void {
    this.limiter = new Bottleneck(options);
    this.limiter.on('error', error => {
      this.logger.error({ ...error }, `Error caught in limiter`);
    });
  }

  public async download({
    destination,
    ...fetchWith
  }: Partial<FetchArguments> & { destination: string }): Promise<void> {
    const url: string = await this.fetchCreateUrl(fetchWith);
    const requestInit = await this.fetchCreateMeta(fetchWith);
    const response = await fetch(url, requestInit);
    await new Promise<void>((resolve, reject) => {
      const fileStream = createWriteStream(destination);
      response.body.pipe(fileStream);
      response.body.on('error', error => reject(error));
      fileStream.on('finish', () => resolve());
    });
  }

  public async fetch<T>(fetchWith: Partial<FetchArguments>): Promise<T> {
    if (this.limiter) {
      return this.limiter.schedule(
        async () => await this.immediateFetch(fetchWith),
      );
    }
    return await this.immediateFetch(fetchWith);
  }

  private async immediateFetch<T>(
    fetchWith: Partial<FetchArguments>,
  ): Promise<T> {
    const url: string = await this.fetchCreateUrl(fetchWith);
    const requestInit = await this.fetchCreateMeta(fetchWith);
    try {
      const response = await fetch(url, requestInit);
      if (fetchWith.process === false) {
        return response as unknown as T;
      }
      return await this.fetchHandleResponse(fetchWith, response);
    } catch (error) {
      this.logger.error({ error });
      return undefined;
    }
  }
}
