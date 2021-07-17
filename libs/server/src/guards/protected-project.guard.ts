import { LIB_SERVER } from '@formio/contracts/constants';
import { ProjectDTO } from '@formio/contracts/formio-sdk';
import {
  ACCESS_LEVEL,
  APIRequest,
  SERVER_METADATA,
} from '@formio/contracts/server';
import { InjectLogger, Trace } from '@formio/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ProtectedProjectGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(ProtectedProjectGuard, LIB_SERVER)
    private readonly logger: PinoLogger,
    private readonly reflector: Reflector,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<APIRequest<ProjectDTO>>();
    const { locals } = request.res;
    const accessLevel = this.reflector.get<ACCESS_LEVEL>(
      SERVER_METADATA.ACCESS_LEVEL,
      context.getHandler(),
    );

    if (!accessLevel || accessLevel === ACCESS_LEVEL.read) {
      return true;
    }
    // Prevent updates that aren't unprotecting the project if it is currently protected
    if (request.body?.protect === false) {
      return true;
    }
    if (locals.project?.protect === true) {
      return false;
    }
    return true;
  }

  // #endregion Public Methods
}
