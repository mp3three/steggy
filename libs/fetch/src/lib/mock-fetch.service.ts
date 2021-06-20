import { LIB_FETCH } from '@automagical/contracts/constants';
import { FetchArguments } from '@automagical/contracts/fetch';
import { InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { BaseFetch } from './base-fetch.service';

type FetchWith<
  T extends Record<never, string> = Record<never, string>
> = Partial<FetchArguments> & T;
@Injectable()
export class MockFetchService extends BaseFetch {
  // #region Constructors

  constructor(
    @InjectLogger(MockFetchService, LIB_FETCH)
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  public async fetch<T>(arguments_: FetchWith): Promise<T> {
    arguments_;
    return undefined;
  }

  // #endregion Public Methods
}
