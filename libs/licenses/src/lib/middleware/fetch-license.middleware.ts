import { LicenseDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { LicenseService } from '@automagical/licenses';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
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
    @InjectPinoLogger(FetchLicenseMiddleware.name)
    protected readonly logger: PinoLogger,
    private readonly licenseService: LicenseService,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async use(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const licenseId = this.licenseService.licenseIdFromReq(req);
    res.locals = {
      licenseId,
      ...res.locals,
      ...(await this.populate(req, res, licenseId)),
    };
    next();
  }

  // #endregion Public Methods

  // #region Private Methods

  private canView(license: LicenseDTO, req: Request, res: Response) {
    if (!license) {
      return false;
    }
    const ownsLicense = license.data.user.some(
      (user) => user._id === res.locals.user._id,
    );
    return ownsLicense || this.isAdmin(req);
  }

  /**
   * Server owner must be able to validate responses going to customer API servers
   *
   * Responses may contain:
   *
   * - license information (linked user ids / names)
   * - utilization (project / stage counts)
   * - environment metadata (project names, ids, active states)
   * - licensed api server capabilities (array of basic strings usually)
   */
  private isAdmin(req: Request) {
    return (
      this.configService.get(ADMIN_TOKEN) ===
      req.headers[this.configService.get(TOKEN_HEADER)]
    );
  }

  private async populate(req: Request, res: Response, licenseId: string) {
    const licenseList = await this.licenseService.licenseFetchByUser(
      res.locals.user as UserDTO,
    );
    const out: { license?: LicenseDTO; licenses?: LicenseDTO[] } = {};
    if (!licenseList) {
      return out;
    }
    out.licenses = licenseList;
    if (!licenseId) {
      return;
    }
    const idx = new Map<string, LicenseDTO>();
    licenseList.forEach((license) =>
      license.data.licenseKeys.forEach((key) => (idx[key.key] = license)),
    );
    if (!idx.has(licenseId)) {
      idx.set(licenseId, await this.licenseService.licenseFetch(licenseId));
    }
    if (this.canView(idx.get(licenseId), req, res)) {
      out.license = idx.get(licenseId);
    }
    return out;
  }

  // #endregion Private Methods
}
