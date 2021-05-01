import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { FormDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnprocessableEntityException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { FormSchema } from '@automagical/persistence';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LoadFormMiddleware implements NestMiddleware {
  // #region Constructors

  constructor(
    @InjectLogger(LoadFormMiddleware, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    @InjectModel(Cat.name) private catModel: Model<CatDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async use(
    req: Request<{ form: string }>,
    res: Response<unknown, { form: FormDTO }>,
    next: NextFunction,
  ): Promise<void> {
    if (!req.params.form) {
      throw new UnprocessableEntityException();
    }
    FormSchema.fi;
    // FormDocument.
    // FormDocument.find({
    //   _id: req.params.form
    // });
    // if (!req.headers['x-jwt-token']) {
    //   throw new HttpException(
    //     {
    //       status: HttpStatus.FORBIDDEN,
    //       error: 'x-jwt-token required',
    //     },
    //     HttpStatus.FORBIDDEN,
    //   );
    // }
    // const user = await this.formioSdkService.userFetch({
    //   token: req.headers['x-jwt-token'] as string,
    // });
    // if (!user) {
    //   throw new HttpException(
    //     {
    //       status: HttpStatus.FORBIDDEN,
    //       error: 'invalid x-jwt-token',
    //     },
    //     HttpStatus.FORBIDDEN,
    //   );
    // }
    // res.locals.user = user;
    next();
  }

  // #endregion Public Methods
}

// public loadEntities(req, model, query, options = {}) {
//   return this.models[model].find(query, options, req.context ? req.context.params : {});
// }

// public loadEntity(req, model, query, options = {}) {
//   return this.loadEntities(req, model, query, options).then((docs) => Array.isArray(docs) ? docs[0] : docs);
// }
