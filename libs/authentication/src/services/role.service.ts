import type { ResponseLocals } from '@automagical/contracts';
import { ResponseFlags, RoleCRUD } from '@automagical/contracts';
import { LIB_AUTHENTICATION } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import {
  AccessDTO,
  PERMISSION_ACCESS_TYPES,
  ProjectDTO,
  RoleDTO,
} from '@automagical/contracts/formio-sdk';
import { ACCESS_LEVEL } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RoleService {
  // #region Constructors

  constructor(
    @InjectLogger(RoleService, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
    @Inject(RoleCRUD)
    private readonly roleService: RoleCRUD,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async getRoles(
    project: ProjectDTO,
    control: ResultControlDTO = {},
  ): Promise<RoleDTO[]> {
    return await await this.roleService.findMany(control, project);
  }

  @Trace()
  public async loadProjectRoles(locals: ResponseLocals): Promise<void> {
    const { roles, flags, user, project } = locals;

    const projectRoles = await this.getRoles(project);

    projectRoles.forEach((role) => {
      if (user.roles.includes(role._id)) {
        // User contains a role registered with the project
        roles.add(role._id);
        return;
      }
      if (role.default && !flags.has(ResponseFlags.JWT_TOKEN)) {
        roles.add(role._id);
        return;
      }
      if (
        role.title === 'Authenticated' &&
        flags.has(ResponseFlags.JWT_TOKEN)
      ) {
        roles.add(role._id);
      }
    });
  }

  @Trace()
  public processRoles(
    accessLevel: ACCESS_LEVEL,
    { roles, user }: ResponseLocals,
    target: { access?: AccessDTO[]; owner?: string },
  ): boolean {
    return target.access?.some((access) => {
      // Run through all the access levels listed on the project
      // Attempt to see if user is allowed for {accessLevel} using this combo of access + identified roles
      switch (accessLevel) {
        // CREATE
        case ACCESS_LEVEL.create:
          if (PERMISSION_ACCESS_TYPES.create_all === access.type) {
            return this.hasRole(access, roles);
          }
          return (
            PERMISSION_ACCESS_TYPES.create_own === access.type &&
            this.hasRole(access, roles) &&
            target.owner === user._id
          );

        // READ
        case ACCESS_LEVEL.read:
          if (PERMISSION_ACCESS_TYPES.read_all === access.type) {
            return this.hasRole(access, roles);
          }
          return (
            PERMISSION_ACCESS_TYPES.create_own === access.type &&
            this.hasRole(access, roles) &&
            target.owner === user._id
          );

        // UPDATE
        case ACCESS_LEVEL.write:
          if (PERMISSION_ACCESS_TYPES.update_all === access.type) {
            return this.hasRole(access, roles);
          }
          return (
            PERMISSION_ACCESS_TYPES.create_own === access.type &&
            this.hasRole(access, roles) &&
            target.owner === user._id
          );

        // DELETE
        case ACCESS_LEVEL.delete:
        case ACCESS_LEVEL.admin:
          if (PERMISSION_ACCESS_TYPES.delete_all === access.type) {
            return this.hasRole(access, roles);
          }
          return (
            PERMISSION_ACCESS_TYPES.create_own === access.type &&
            this.hasRole(access, roles) &&
            target.owner === user._id
          );
      }
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private hasRole(access: AccessDTO, roles: Set<string>): boolean {
    return access.roles.some((role) => roles.has(role));
  }

  // #endregion Private Methods
}
