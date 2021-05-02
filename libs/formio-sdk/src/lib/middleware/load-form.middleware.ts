import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { FormDTO } from '@automagical/contracts/formio-sdk';
import { FormService } from '@automagical/persistence';
import { InjectLogger, Trace } from '@automagical/utilities';
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnprocessableEntityException,
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
    req: Request<{ formId: string }>,
    res: Response<unknown, { form: FormDTO }>,
    next: NextFunction,
  ): Promise<void> {
    if (!req.params.formId) {
      throw new UnprocessableEntityException();
    }
    res.locals.form = await this.formService.byId(req.params.formId);
    if (!res.locals.form) {
      throw new BadRequestException();
    }
    next();
  }

  // #endregion Public Methods
}
