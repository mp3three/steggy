import {
  LicenseDataDTO,
  LicenseDTO,
  SubmissionDTO,
} from '@automagical/contracts';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

type Response = LicenseDTO | LicenseDTO[];
type StrippedKeys = SubmissionDTO<Omit<LicenseDataDTO, 'licenseKeys'>>;

/**
 * This interceptor attempts to prevent the inclusion of license keys in the reponse
 */
@Injectable()
export class InterceptLicenseKeys
  implements NestInterceptor<Response, StrippedKeys | StrippedKeys[]> {
  // #region Public Methods

  public intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((res: Response) => this.cleanup(res)));
  }

  // #endregion Public Methods

  // #region Private Methods

  private cleanup(res: Response) {
    const set = (license: LicenseDTO) => ({
      ...license,
      data: {
        ...license.data,
        licenseKeys: null,
      },
    });
    if (res instanceof Array) {
      return res.map(set);
    }
    return set(res);
  }

  // #endregion Private Methods
}
