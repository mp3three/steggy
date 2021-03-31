import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HasLicenseGuard implements CanActivate {
  // #region Public Methods

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const response = context.switchToHttp().getResponse();
    return !!response.locals.licenses;

    // return response.locals;
  }

  // #endregion Public Methods
}
