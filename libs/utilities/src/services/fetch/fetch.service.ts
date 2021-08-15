import { FetchArguments } from '@automagical/contracts/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { createWriteStream } from 'fs';
import fetch from 'node-fetch';

import { Trace } from '../../decorators/logger';
import { AutoLogService } from '../logger/auto-log.service';
import { BaseFetch } from './base-fetch.service';

@Injectable({ scope: Scope.TRANSIENT })
export class FetchService extends BaseFetch {
  // #region Object Properties

  public TRUNCATE_LENGTH = 200;

  // #endregion Object Properties

  // #region Constructors

  constructor(protected readonly logger: AutoLogService) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async fetch<T>(fetchWtih: Partial<FetchArguments>): Promise<T> {
    const url: string = await this.fetchCreateUrl(fetchWtih);
    const requestInit = await this.fetchCreateMeta(fetchWtih);
    try {
      const response = await fetch(url, requestInit);
      if (fetchWtih.process === false) {
        return response as unknown as T;
      }
      return await this.fetchHandleResponse(fetchWtih, response);
    } catch (error) {
      this.logger.error(error);
      return undefined;
    }
  }

  public async download(
    fetchWith: Partial<FetchArguments> & { destination: string },
  ): Promise<void> {
    const url: string = await this.fetchCreateUrl(fetchWith);
    const requestInit = await this.fetchCreateMeta(fetchWith);
    const response = await fetch(url, requestInit);
    await new Promise<void>((resolve, reject) => {
      const fileStream = createWriteStream(fetchWith.destination);
      response.body.pipe(fileStream);
      response.body.on('error', (error) => {
        reject(error);
      });
      fileStream.on('finish', () => {
        resolve();
      });
    });
  }

  // #endregion Public Methods
}
