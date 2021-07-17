import { LIB_AUTHENTICATION } from '@automagical/contracts/constants';
import {
  PERMISSION_ACCESS_TYPES,
  ProjectDTO,
  TeamDTO,
  UserDTO,
} from '@automagical/contracts/formio-sdk';
import {
  ACCESS_LEVEL,
  APIResponse,
  SERVER_METADATA,
} from '@automagical/contracts/server';
import { MemberService } from '@automagical/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';

/**
 * Dual use guard -
 *
 * - Loads team roles for other guards
 * - Validates access for teams routes
 */
@Injectable()
export class TeamGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(TeamGuard, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
    private readonly reflector: Reflector,
    private readonly memberService: MemberService,
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
    if (!locals.user) {
      return true;
    }

    const teams = await this.memberService.userTeams(
      locals.user as UserDTO,
      locals,
    );
    teams.forEach((team) => locals.roles.add(team._id));

    // Retrieve access level defined in controller annotations
    const accessLevel = this.reflector.get<ACCESS_LEVEL>(
      SERVER_METADATA.ACCESS_TYPE,
      context.getHandler(),
    );

    let canActivate = false;
    switch (accessLevel) {
      case ACCESS_LEVEL.team_admin:
        canActivate = this.hasPermission(
          locals.project,
          teams,
          PERMISSION_ACCESS_TYPES.team_admin,
        );
        break;
      case ACCESS_LEVEL.team_write:
        canActivate = this.hasPermission(
          locals.project,
          teams,
          PERMISSION_ACCESS_TYPES.team_write,
        );
        break;
      case ACCESS_LEVEL.team_access:
        canActivate = this.hasPermission(
          locals.project,
          teams,
          PERMISSION_ACCESS_TYPES.team_access,
        );
        break;
      case ACCESS_LEVEL.team_read:
        canActivate = this.hasPermission(
          locals.project,
          teams,
          PERMISSION_ACCESS_TYPES.team_read,
        );
        break;
    }
    if (canActivate) {
      locals.authenticated = true;
    }

    return true;
  }

  // #endregion Public Methods

  // #region Private Methods

  /**
   * Does any of the teams associated with the role have the indicated permission?
   */
  private hasPermission(
    project: ProjectDTO,
    teams: TeamDTO[],
    type: PERMISSION_ACCESS_TYPES,
  ): boolean {
    return project.access.some((access) => {
      if (access.type !== type) {
        return false;
      }
      return access.roles.some((role) => {
        return teams.some((team) => team._id === role);
      });
    });
  }

  // #endregion Private Methods
}
