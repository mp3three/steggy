import { RoleService } from '@automagical/authentication';
import { ActionItemCRUD, ProjectCRUD } from '@automagical/contracts';
import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  LIB_SERVER,
} from '@automagical/contracts/constants';
import type { FetchAuth, ResultControlDTO } from '@automagical/contracts/fetch';
import { ProjectDTO, RoleDTO } from '@automagical/contracts/formio-sdk';
import { LicenseTrackables } from '@automagical/contracts/licenses';
import {
  ACCESS_LEVEL,
  ACCESS_TYPE,
  PATH_PARAMETERS,
  SwaggerParameters,
} from '@automagical/contracts/server';
import {
  PROJECT_CREATE_DESCRIPTION,
  PROJECT_CREATE_EXTERNAL_DOCS,
  PROJECT_CREATE_SUMMARY,
  PROJECT_UPDATE_DESCRIPTION,
  PROJECT_UPDATE_EXTERNAL_DOCS,
  PROJECT_UPDATE_SUMMARY,
} from '@automagical/documentation';
import {
  LicenseItemTracker,
  LicenseRequireActive,
  LicenseTrackRoute,
} from '@automagical/licenses';
import { InjectLogger } from '@automagical/utilities';
import {
  Body,
  CacheInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  Inject,
  InternalServerErrorException,
  NotImplementedException,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PinoLogger } from 'nestjs-pino';

import {
  AuthProperties,
  PermissionCheck,
  PermissionScope,
  Project,
} from '../decorators';
import { EmitEventAfter } from '../decorators/emit-after.decorator';
import { ProtectedProjectGuard } from '../guards';
import { ProjectValidatorPipe, QueryToControlPipe } from '../pipes';

@Controller('/project')
@PermissionScope(ACCESS_TYPE.project)
@ApiTags('project')
@UseInterceptors(CacheInterceptor)
@LicenseItemTracker({
  primaryIdentifier: PATH_PARAMETERS.projectId,
  type: LicenseTrackables.projects,
})
@UseGuards(ProtectedProjectGuard)
export class ProjectController {
  // #region Constructors

  constructor(
    @InjectLogger(ProjectController, LIB_SERVER)
    private readonly logger: PinoLogger,
    @Inject(ProjectCRUD)
    private readonly projectService: ProjectCRUD,
    private readonly roleService: RoleService,
    @Inject(ActionItemCRUD) private readonly actionItemCRUD: ActionItemCRUD,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Delete(`/:projectId`)
  @PermissionCheck(ACCESS_LEVEL.delete, { project: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  @LicenseTrackRoute()
  @LicenseRequireActive()
  @EmitEventAfter(DELETE_PROJECT, 'project')
  public async delete(
    @Project() project: ProjectDTO,
    @AuthProperties() auth: FetchAuth,
  ): Promise<string> {
    const result = await this.projectService.delete(project, auth);
    if (result) {
      return 'ok';
    }
    throw new InternalServerErrorException();
  }

  @Get(`/:projectId/spec.json`)
  public async spec(): Promise<string> {
    return '{}';
  }

  @Get('/access')
  @PermissionCheck(ACCESS_LEVEL.read, { project: true })
  public accessInfo(): Promise<never> {
    throw new NotImplementedException();
  }

  @Get('/')
  @PermissionCheck(ACCESS_LEVEL.read, { project: true })
  public async findAll(
    @Query(QueryToControlPipe) filters: ResultControlDTO,
    @AuthProperties() auth: FetchAuth,
  ): Promise<ProjectDTO[]> {
    return await this.projectService.findMany(filters, auth);
  }

  @Get(`/:projectId/role`)
  @PermissionCheck(ACCESS_LEVEL.read, { project: true })
  public async getRole(
    @Project() project: ProjectDTO,
    @Query(QueryToControlPipe) filters: ResultControlDTO,
  ): Promise<RoleDTO[]> {
    return await this.roleService.getRoles(project, filters);
  }

  @Get(`/:projectId/export`)
  @PermissionCheck(ACCESS_LEVEL.read, { project: true })
  @ApiTags('export')
  public async export(): Promise<never> {
    throw new NotImplementedException();
  }

  @Get(`/:projectId/token`)
  @PermissionCheck(ACCESS_LEVEL.create, { project: true })
  @LicenseRequireActive()
  public tempAuthToken(): Promise<never> {
    throw new NotImplementedException();
  }

  @Get(`/:projectId`)
  @PermissionCheck(ACCESS_LEVEL.read, { project: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  public async findById(@Project() project: ProjectDTO): Promise<ProjectDTO> {
    return project;
  }

  @Get(`/:projectId/tag/current`)
  @PermissionCheck(ACCESS_LEVEL.read, { project: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  public async getCurrentTag(): Promise<never> {
    throw new NotImplementedException();
  }

  @Get(`/:projectId/sqlconnector`)
  @PermissionCheck(ACCESS_LEVEL.delete, { project: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  public async sqlConnector(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/available')
  @PermissionCheck(ACCESS_LEVEL.read, { project: true })
  public async isAvailable(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/report')
  @PermissionCheck(ACCESS_LEVEL.admin, { project: true })
  public async report(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/upgrade')
  @PermissionCheck(ACCESS_LEVEL.delete, { project: true })
  public async upgradeProject(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/admin')
  @PermissionCheck(ACCESS_LEVEL.admin, { project: true })
  @ApiTags('admin')
  @ApiCreatedResponse({
    description: 'Create a new project admin',
  })
  public adminCreate(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/')
  @PermissionCheck(ACCESS_LEVEL.delete, { project: true })
  @HttpCode(201)
  @Header('Cache-Control', 'none')
  @ApiCreatedResponse({
    description: 'Project created',
    type: ProjectDTO,
  })
  @ApiOperation({
    description: PROJECT_CREATE_DESCRIPTION,
    externalDocs: PROJECT_CREATE_EXTERNAL_DOCS,
    summary: PROJECT_CREATE_SUMMARY,
  })
  @LicenseTrackRoute()
  @LicenseRequireActive()
  @EmitEventAfter(CREATE_PROJECT)
  public async create(
    @Body(ProjectValidatorPipe) project: ProjectDTO,
    @AuthProperties() auth: FetchAuth,
  ): Promise<ProjectDTO> {
    return await this.projectService.create(project, auth);
  }

  @Post('/import')
  @PermissionCheck(ACCESS_LEVEL.create, { project: true })
  @LicenseRequireActive()
  public import(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post(`/:projectId/deploy`)
  @PermissionCheck(ACCESS_LEVEL.create, { project: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  public async deployTag(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post(`/:projectId/portal-check`)
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  public async portalCheck(): Promise<never> {
    throw new NotImplementedException();
  }

  @Put(`/:projectId`)
  @PermissionCheck(ACCESS_LEVEL.write, { project: true })
  @ApiOperation({
    description: PROJECT_UPDATE_DESCRIPTION,
    externalDocs: PROJECT_UPDATE_EXTERNAL_DOCS,
    summary: PROJECT_UPDATE_SUMMARY,
  })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  @LicenseTrackRoute()
  @LicenseRequireActive()
  public async update(
    @Project() project: ProjectDTO,
    @Body(ProjectValidatorPipe) update: Partial<ProjectDTO>,
    @AuthProperties() auth: FetchAuth,
  ): Promise<ProjectDTO> {
    return await this.projectService.update(project, update, auth);
  }

  @Throttle(2, 60)
  @Post('/admin/login')
  @ApiTags('admin')
  public adminLogin(): Promise<never> {
    throw new NotImplementedException();
  }

  // #endregion Public Methods
}
