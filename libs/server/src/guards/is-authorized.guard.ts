import { Trace } from '@automagical/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { APIResponse } from '../contracts';

@Injectable()
export class IsAuthorizedGuard implements CanActivate {
  @Trace()
  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { locals } = context.switchToHttp().getResponse<APIResponse>();
    return locals.authenticated;
  }
}
