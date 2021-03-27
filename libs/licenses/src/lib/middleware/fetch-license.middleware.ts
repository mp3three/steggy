import { Logger } from '@automagical/logger';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { FormioSdkService, UserDTO } from '@automagical/formio-sdk';
import { LicenseService } from '@automagical/licenses';

@Injectable()
export class FetchLicenseMiddleware implements NestMiddleware {
  // #region Static Properties

  private static readonly FORM_PATH = 'license2/submission';

  // #endregion Static Properties

  // #region Object Properties

  private readonly logger = Logger(FetchLicenseMiddleware);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly licenseService: LicenseService) {}

  // #endregion Constructors

  // #region Public Methods

  public async use(req: Request, res: Response, next: NextFunction) {
    res.locals.licenses = await this.licenseService.loadLicenses(
      res.locals.user,
    );
    next();
  }

  // #endregion Public Methods
}
