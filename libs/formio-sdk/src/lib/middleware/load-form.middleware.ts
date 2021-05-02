import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { FormService } from '@automagical/persistence';
import { InjectLogger, Trace } from '@automagical/utilities';
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  PreconditionFailedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoadFormMiddleware implements NestMiddleware {
  // #region Constructors

  constructor(
    @InjectLogger(LoadFormMiddleware, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    private readonly formService: FormService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async use(
    request: Request<{ formId: string }>,
    response: Response<unknown, { form: SubmissionDTO }>,
    next: NextFunction,
  ): Promise<void> {
    if (!request.params.formId) {
      throw new PreconditionFailedException();
    }
    response.locals.form = await this.formService.byId(request.params.formId);
    if (!response.locals.form) {
      throw new BadRequestException();
    }
    next();
  }

  // #endregion Public Methods
}
