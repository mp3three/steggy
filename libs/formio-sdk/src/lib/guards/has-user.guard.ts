import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HasUserGuard implements CanActivate {
  // #region Public Methods

  public async canActivate(context: ExecutionContext): boolean {
    const response = context.switchToHttp().getResponse();
    return !!response.locals.user;

    // return response.locals;
  }

  // #endregion Public Methods
}
