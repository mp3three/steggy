import { RoleCRUD } from '@automagical/contracts';
import { LIB_SERVER } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { ProjectDTO, RoleDTO } from '@automagical/contracts/formio-sdk';
import {
  ACCESS_LEVEL,
  ACCESS_TYPE,
  PATH_PARAMETERS,
  SwaggerParameters,
} from '@automagical/contracts/server';
import { InjectLogger } from '@automagical/utilities';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';

import {
  Control,
  PermissionCheck,
  PermissionScope,
  Project,
} from '../decorators';
import { ProtectedProjectGuard } from '../guards';
import { RoleValidatorPipe } from '../pipes';

@Controller('/project/:projectId/role')
@ApiTags('role')
@UseGuards(ProtectedProjectGuard)
@PermissionScope(ACCESS_TYPE.project)
export class RoleController {
  // #region Constructors

  constructor(
    @InjectLogger(RoleController, LIB_SERVER)
    private readonly logger: PinoLogger,
    @Inject(RoleCRUD)
    private readonly roleService: RoleCRUD,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Delete('/:roleId')
  @PermissionCheck(ACCESS_LEVEL.delete, { project: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  public async delete(
    @Param('roleId') roleId: string,
    @Project() project: ProjectDTO,
  ): Promise<string> {
    const result = await this.roleService.delete(roleId, project);
    if (result) {
      return 'ok';
    }
    throw new InternalServerErrorException();
  }

  @Get('/')
  @PermissionCheck(ACCESS_LEVEL.read, { project: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  public async findAll(
    @Control() control: ResultControlDTO,
    @Project() project: ProjectDTO,
  ): Promise<RoleDTO[]> {
    return await this.roleService.findMany(control, project);
  }

  @Get('/:roleId')
  @PermissionCheck(ACCESS_LEVEL.read, { project: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.roleId)
  public async findOne(
    @Param('roleId') roleId: string,
    @Project() project: ProjectDTO,
  ): Promise<RoleDTO> {
    return await this.roleService.findById(roleId, project);
  }

  @Post('/')
  @PermissionCheck(ACCESS_LEVEL.create, { project: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  public async create(
    @Body(RoleValidatorPipe) role: RoleDTO,
    @Project() project: ProjectDTO,
  ): Promise<RoleDTO> {
    return await this.roleService.create(role, project);
  }

  @Put('/:roleId')
  @PermissionCheck(ACCESS_LEVEL.write, { project: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.roleId)
  public async update(
    @Body(RoleValidatorPipe) role: RoleDTO,
    @Project() project: ProjectDTO,
  ): Promise<RoleDTO> {
    return await this.roleService.update(role, project);
  }

  // #endregion Public Methods
}
