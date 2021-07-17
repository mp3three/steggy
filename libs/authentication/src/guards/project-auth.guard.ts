import { ResponseFlags } from '@automagical/contracts';
import { LIB_AUTHENTICATION } from '@automagical/contracts/constants';
import {
  ACCESS_LEVEL,
  APIResponse,
  SERVER_METADATA,
} from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';

import { RoleService } from '../services/role.service';

@Injectable()
export class ProjectAuthGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(ProjectAuthGuard, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
    private readonly reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const { locals } = context.switchToHttp().getResponse<APIResponse>();

    if (locals.authenticated) {
      // Something gave the thumbs up already
      // Probably an api key
      return true;
    }

    // Owner is always allowed to mess with projects
    if (locals.project?.owner === locals.session?.user?._id) {
      locals.authenticated = true;
      locals.flags.add(ResponseFlags.PROJECT_OWNER);
      return true;
    }

    // Retrieve access level defined in controller annotations
    const accessLevel = this.reflector.get<ACCESS_LEVEL>(
      SERVER_METADATA.ACCESS_TYPE,
      context.getHandler(),
    );

    if (!accessLevel) {
      // This should never occur
      // If it does, someone is using the wrong annotations
      this.logger.fatal(`No ACCESS_LEVEL defined`);

      // Kill the server immediately. Defs shouldn't hit prod like this
      // eslint-disable-next-line unicorn/no-process-exit
      // process.exit();
      return false;
      // Number of times this worked: 1
    }

    // Build up additional roles
    await this.roleService.loadProjectRoles(locals);
    locals.authenticated = this.roleService.processRoles(
      accessLevel,
      locals,
      locals.project,
    );
    return true;
  }

  // #endregion Public Methods
}
