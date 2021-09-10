import { APIResponse } from '@automagical/contracts/server';
import { Trace } from '@automagical/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Mostly useful for testing
 */
@Injectable()
export class AuthBypassGuard implements CanActivate {
  @Trace()
  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { locals } = context.switchToHttp().getResponse<APIResponse>();
    locals.authenticated = true;
    return true;
  }
}
