import { Logger } from '@automagical/logger';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { FormioSdkService, UserDTO } from '@automagical/formio-sdk';

@Injectable()
export class FetchLicenseMiddleware implements NestMiddleware {
  // #region Static Properties

  private static readonly FORM_PATH = 'license2/submission';

  // #endregion Static Properties

  // #region Object Properties

  private readonly logger = Logger(FetchLicenseMiddleware);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly formioSdkService: FormioSdkService) {}

  // #endregion Constructors

  // #region Public Methods

  public async use(req: Request, res: Response, next: NextFunction) {
    res.locals.licenses = await this.formioSdkService.fetch({
      url: FetchLicenseMiddleware.FORM_PATH,
      filters: [
        {
          field: 'data.user._id',
          equals: (res.locals.user as UserDTO)._id,
        },
        {
          limit: 100,
        },
      ],
    });
    next();
  }

  // #endregion Public Methods
}
