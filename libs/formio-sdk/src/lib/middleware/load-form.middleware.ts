import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { FormDTO } from '@automagical/contracts/formio-sdk';
import { FormDocument } from '@automagical/persistence';
import { InjectLogger, Trace } from '@automagical/utilities';
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoadFormMiddleware implements NestMiddleware {
  // #region Constructors

  constructor(
    @InjectLogger(LoadFormMiddleware, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    @InjectModel(FormDTO.name) private readonly formModel: Model<FormDocument>,
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
    res.locals.form = await this.formModel
      .findOne({
        _id: req.params.formId,
      })
      .exec();
    if (!res.locals.form) {
      throw new BadRequestException();
    }
    next();
  }

  // #endregion Public Methods
}
