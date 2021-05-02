import { LIB_LICENSES } from '@automagical/contracts/constants';
import { LicenseDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { LicenseService } from '@automagical/licenses';
import { InjectLogger } from '@automagical/utilities';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { ADMIN_TOKEN, TOKEN_HEADER } from '../../typings';

/**
 * This middleware populates:
 *
 * - res.locals.licenses:LicenseDTO[]
 *   - Based on x-jwt-token
 * - res.locals.license:LicenseDTO
 *   - Based on provided licenseId (and ownership of / admin status)
 *   - See: licenseService.licenceIdFromReq for possible sources
 */
@Injectable()
export class FetchLicenseMiddleware implements NestMiddleware {
  // #region Static Properties

  private static readonly FORM_PATH = 'license2/submission';

  // #endregion Static Properties

  // #region Constructors

  constructor(
    @InjectLogger(FetchLicenseMiddleware, LIB_LICENSES)
    protected readonly logger: PinoLogger,
    private readonly licenseService: LicenseService,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const licenseId = this.licenseService.licenseIdFromReq(request);
    response.locals = {
      licenseId,
      ...response.locals,
      ...(await this.populate(request, response, licenseId)),
    };
    next();
  }

  // #endregion Public Methods

  // #region Private Methods

  private canView(license: LicenseDTO, request: Request, response: Response) {
    if (!license) {
      return false;
    }
    const ownsLicense = license.data.user.some(
      (user) => user._id === response.locals.user._id,
    );
    return ownsLicense || this.isAdmin(request);
  }

  private isAdmin(request: Request) {
    return (
      this.configService.get(ADMIN_TOKEN) ===
      request.headers[this.configService.get(TOKEN_HEADER)]
    );
  }

  private async populate(
    request: Request,
    response: Response,
    licenseId: string,
  ) {
    const licenseList = await this.licenseService.licenseFetchByUser(
      response.locals.user as UserDTO,
    );
    const out: { license?: LicenseDTO; licenses?: LicenseDTO[] } = {};
    if (!licenseList) {
      return out;
    }
    out.licenses = licenseList;
    if (!licenseId) {
      return;
    }
    const index = new Map<string, LicenseDTO>();
    licenseList.forEach((license) =>
      license.data.licenseKeys.forEach((key) => (index[key.key] = license)),
    );
    if (!index.has(licenseId)) {
      index.set(licenseId, await this.licenseService.licenseFetch(licenseId));
    }
    if (this.canView(index.get(licenseId), request, response)) {
      out.license = index.get(licenseId);
    }
    return out;
  }

  // #endregion Private Methods
}
