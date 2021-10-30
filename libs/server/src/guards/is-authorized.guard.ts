import { InjectConfig, Trace } from '@automagical/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AUTH_BYPASS } from '../config';

import { APIResponse } from '../contracts';

@Injectable()
export class IsAuthorizedGuard implements CanActivate {
  constructor(
    @InjectConfig(AUTH_BYPASS) private readonly authBypass: boolean,
  ) {}
  @Trace()
  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { locals } = context.switchToHttp().getResponse<APIResponse>();
    return locals.authenticated || this.authBypass;
  }
}
