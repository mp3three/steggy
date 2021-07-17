import { LIB_UTILS } from '@formio/contracts/constants';
import { FetchArguments } from '@formio/contracts/fetch';
import { BaseFetch, InjectLogger } from '@formio/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

type FetchWith<T extends Record<never, string> = Record<never, string>> =
  Partial<FetchArguments> & T;
@Injectable()
export class MockFetchService extends BaseFetch {
  // #region Constructors

  constructor(
    @InjectLogger(MockFetchService, LIB_UTILS)
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
