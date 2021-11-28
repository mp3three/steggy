import { Injectable, Scope } from '@nestjs/common';
import { createWriteStream } from 'fs';
import fetch from 'node-fetch';

import { FetchArguments } from '../../contracts';
import { AutoLogService } from '../auto-log.service';
import { BaseFetchService } from './base-fetch.service';

const DEFAULT_TRUNCATE_LENGTH = 200;
@Injectable({ scope: Scope.TRANSIENT })
export class FetchService extends BaseFetchService {
  constructor(protected readonly logger: AutoLogService) {
    super();
  }

  public TRUNCATE_LENGTH = DEFAULT_TRUNCATE_LENGTH;

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
      response.body.on('error', (error) => {
        reject(error);
      });
      fileStream.on('finish', () => {
        resolve();
      });
    });
  }

  public async fetch<T>(fetchWith: Partial<FetchArguments>): Promise<T> {
    const url: string = await this.fetchCreateUrl(fetchWith);
    const requestInit = await this.fetchCreateMeta(fetchWith);
    try {
      const response = await fetch(url, requestInit);
      if (fetchWith.process === false) {
        return response as unknown as T;
      }
      return await this.fetchHandleResponse(fetchWith, response);
    } catch (error) {
      this.logger.error(error);
      return undefined;
    }
  }
}
