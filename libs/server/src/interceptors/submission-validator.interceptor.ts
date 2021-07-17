import { LIB_SERVER } from '@automagical/contracts/constants';
import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import type { APIRequest } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';

import { ValidatorService } from '../services';

@Injectable()
export class SubmissionValidatorInterceptor implements NestInterceptor {
  // #region Constructors

  constructor(
    @InjectLogger(SubmissionValidatorInterceptor, LIB_SERVER)
    private readonly logger: PinoLogger,
    private readonly validatorService: ValidatorService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context
      .switchToHttp()
      .getRequest<APIRequest<SubmissionDTO>>();
    const { locals } = request.res;
    if (typeof request.body?.data === 'object') {
      request.body = await this.validatorService.validateSubmission(
        request.body,
        request,
      );
      locals.submission ??= request.body;
    }
    return next.handle();
  }

  // #endregion Public Methods
}
