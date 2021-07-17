import { LIB_UTILS } from '@formio/contracts/constants';
import { SubmissionDTO } from '@formio/contracts/formio-sdk';
import { APIRequest } from '@formio/contracts/server';
import { Inject, Injectable, Scope } from '@nestjs/common';
import dayjs from 'dayjs';
import _ from 'lodash';
import moment from 'moment';
import { PinoLogger } from 'nestjs-pino';
import { VM } from 'vm2';

import { InjectLogger, Trace } from '../decorators';

@Injectable({ scope: Scope.REQUEST })
export class VMService {
  // #region Constructors

  constructor(
    @InjectLogger(VMService, LIB_UTILS) private readonly logger: PinoLogger,
    @Inject(APIRequest) private readonly request: APIRequest<SubmissionDTO>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async exec<T>(
    body: string,
    parameters?: Record<string, unknown>,
  ): Promise<T> {
    const { locals } = this.request.res;
    return new VM({
      eval: false,
      fixAsync: true,
      sandbox: {
        _,
        dayjs,
        headers: this.request.headers,
        logger: this.logger,
        moment,
        request: this.request,
        response: this.request.res,
        ...locals,
        ...(parameters || {}),
        body: this.request.body || locals.submission,
        data: this.request.body?.data ?? locals.submission?.data,
        submission: this.request.body || locals.submission,
      },
      timeout: 250,
      wasm: false,
    }).run(body);
  }

  // #endregion Public Methods
}
