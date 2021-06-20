import { ActionRunnerService } from '@automagical/action';
import { FormCRUD } from '@automagical/contracts';
import {
  CREATE_FORM,
  DELETE_FORM,
  LIB_SERVER,
} from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import {
  ACTION_NAMES,
  FormDTO,
  ProjectDTO,
} from '@automagical/contracts/formio-sdk';
import {
  ACCESS_LEVEL,
  ACCESS_TYPE,
  PATH_PARAMETERS,
  SwaggerParameters,
} from '@automagical/contracts/server';
import {
  FORM_BUILD_DTO_DESCRIPTION,
  FORM_BUILD_DTO_SUMMARY,
  FORM_CREATE_DESCRIPTION,
  FORM_CREATE_EXTERNAL_DOCS,
  FORM_CREATE_SUMMARY,
  FORM_UPDATE_DESCRIPTION,
  FORM_UPDATE_EXTERNAL_DOCS,
  FORM_UPDATE_SUMMARY,
} from '@automagical/documentation';
import { LicenseRequireActive } from '@automagical/licenses';
import { TypeWriterService } from '@automagical/type-writer';
import { InjectLogger } from '@automagical/utilities';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotImplementedException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';

import { Form, PermissionCheck, PermissionScope, Project } from '../decorators';
import { EmitEventAfter } from '../decorators/emit-after.decorator';
import { ProtectedProjectGuard } from '../guards';
import { FormValidatorPipe, QueryToControlPipe } from '../pipes';

@Controller(`/project/:${PATH_PARAMETERS.projectId}/form`)
@ApiTags('form')
@PermissionScope(ACCESS_TYPE.form)
@UseGuards(ProtectedProjectGuard)
export class FormController {
  // #region Constructors

  constructor(
    @InjectLogger(FormController, LIB_SERVER)
    private readonly logger: PinoLogger,
    @Inject(FormCRUD)
    private readonly formService: FormCRUD,
    private readonly typeWriterService: TypeWriterService,
    private readonly actionService: ActionRunnerService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Delete(`/:formId`)
  @PermissionCheck(ACCESS_LEVEL.delete, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  @LicenseRequireActive()
  @EmitEventAfter(DELETE_FORM, 'form')
  public async delete(
    @Form() form: FormDTO,
    @Project() project: ProjectDTO,
  ): Promise<string> {
    const result = await this.formService.delete(form, project);
    if (result) {
      return 'ok';
    }
    throw new InternalServerErrorException();
  }

  @Get(`/:formId/actions`)
  @PermissionCheck(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async actionInfo(): Promise<unknown[]> {
    return this.actionService.listInfo();
  }

  @Get(`/:formId/exists`)
  @PermissionCheck(ACCESS_LEVEL.create, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async exists(@Form() form: FormDTO): Promise<{ _id: string }> {
    return { _id: form._id };
  }

  @Get(`/:formId`)
  @PermissionCheck(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async findById(@Form() form: FormDTO): Promise<FormDTO> {
    return form;
  }

  @Get(`/:formId/spec.json`)
  @PermissionCheck(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async getFormSwagger(): Promise<never> {
    throw new NotImplementedException();
  }

  @Get(`/:formId/v/:revisionNumber`)
  @PermissionCheck(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async getRevision(): Promise<never> {
    throw new NotImplementedException();
  }

  @Get(`/:formId/v`)
  @PermissionCheck(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async listRevisions(): Promise<never> {
    throw new NotImplementedException();
  }

  @Get('/')
  @PermissionCheck(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  public async search(
    @Query(QueryToControlPipe) filters: ResultControlDTO,
    @Project() project: ProjectDTO,
  ): Promise<FormDTO[]> {
    return await this.formService.findMany(filters, project);
  }

  @Get(`/:formId/actions/:actionName`)
  @PermissionCheck(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(
    PATH_PARAMETERS.projectId,
    PATH_PARAMETERS.formId,
    PATH_PARAMETERS.actionName,
  )
  public async getAction(
    @Param('actionName') actionName: ACTION_NAMES,
  ): Promise<unknown> {
    return this.actionService.getAction(actionName).settingsForm;
  }

  @Get(`/:formId/dto`)
  @PermissionCheck(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  @ApiTags('dto')
  @ApiOperation({
    description: FORM_BUILD_DTO_DESCRIPTION,
    summary: FORM_BUILD_DTO_SUMMARY,
  })
  public async buildFormDTO(@Form() form: FormDTO): Promise<unknown> {
    return await this.typeWriterService.dtoFromForm(form);
  }

  @Post('/')
  @PermissionCheck(ACCESS_LEVEL.create, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  @ApiOperation({
    description: FORM_CREATE_DESCRIPTION,
    externalDocs: FORM_CREATE_EXTERNAL_DOCS,
    summary: FORM_CREATE_SUMMARY,
  })
  @LicenseRequireActive()
  @EmitEventAfter(CREATE_FORM)
  public async create(
    @Body(FormValidatorPipe) form: FormDTO,
    @Project() project: ProjectDTO,
  ): Promise<FormDTO> {
    return await this.formService.create(form, project);
  }

  @Put(`/:formId`)
  @PermissionCheck(ACCESS_LEVEL.write, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  @ApiOperation({
    description: FORM_UPDATE_DESCRIPTION,
    externalDocs: FORM_UPDATE_EXTERNAL_DOCS,
    summary: FORM_UPDATE_SUMMARY,
  })
  @LicenseRequireActive()
  public async update(
    @Body(FormValidatorPipe) update: Partial<FormDTO>,
    @Project() project: ProjectDTO,
    @Form() form: FormDTO,
  ): Promise<FormDTO> {
    return await this.formService.update(
      {
        ...form,
        ...update,
      },
      project,
    );
  }

  // #endregion Public Methods
}
