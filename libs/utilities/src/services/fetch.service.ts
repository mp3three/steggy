import { LIB_UTILS } from '@automagical/contracts/constants';
import { FetchArguments } from '@automagical/contracts/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import fetch from 'node-fetch';

import { InjectLogger, Trace } from '../decorators';
import { BaseFetch } from './base-fetch.service';

@Injectable({ scope: Scope.TRANSIENT })
export class FetchService extends BaseFetch {
  // #region Object Properties

  public TRUNCATE_LENGTH = 200;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(FetchService, LIB_UTILS)
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
      if (arguments_.process === false) {
        return response as unknown as T;
      }
      return await this.fetchHandleResponse(arguments_, response);
    } catch (error) {
      this.logger.error(error);
      return undefined;
    }
  }

  // #endregion Public Methods
}
