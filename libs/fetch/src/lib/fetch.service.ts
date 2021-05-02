import { LIB_FETCH } from '@automagical/contracts/constants';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import fetch from 'node-fetch';

import { FetchArguments } from '../typings';
import { BaseFetch } from './base-fetch.service';

@Injectable()
export class FetchService extends BaseFetch {
  // #region Object Properties

  public TRUNCATE_LENGTH = 200;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(FetchService, LIB_FETCH)
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async fetch<T>(arguments_: Partial<FetchArguments>): Promise<T> {
    const url: string = await this.fetchCreateUrl(arguments_);
    const requestInit = await this.fetchCreateMeta(arguments_);
    try {
      const response = await fetch(url, requestInit);
      return await this.fetchHandleResponse(arguments_, response);
    } catch (error) {
      this.logger.error(error);
      return undefined;
    }
  }

  // #endregion Public Methods
}
