import { ActionCRUD } from '@automagical/contracts';
import { LIB_SERVER } from '@automagical/contracts/constants';
import type { ResultControlDTO } from '@automagical/contracts/fetch';
import { ActionDTO, FormDTO } from '@automagical/contracts/formio-sdk';
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
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';

import { Action, Form, PermissionCheck, PermissionScope } from '../decorators';
import { ActionValidatorPipe, QueryToControlPipe } from '../pipes';

@Controller(
  `/project/:${PATH_PARAMETERS.projectId}/form/:${PATH_PARAMETERS.formId}/action`,
)
@ApiTags('action')
@PermissionScope(ACCESS_TYPE.form)
export class ActionController {
  // #region Constructors

  constructor(
    @InjectLogger(ActionController, LIB_SERVER)
    private readonly logger: PinoLogger,
    @Inject(ActionCRUD)
    private readonly actionService: ActionCRUD,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Delete(`/:actionId`)
  @PermissionCheck(ACCESS_LEVEL.delete, { form: true })
  @SwaggerParameters(
    PATH_PARAMETERS.projectId,
    PATH_PARAMETERS.formId,
    PATH_PARAMETERS.actionId,
  )
  public async delete(
    @Param(PATH_PARAMETERS.actionId) actionId: string,
    @Form() form: FormDTO,
  ): Promise<unknown> {
    return await this.actionService.delete(actionId, form);
  }

  @Get('/')
  @PermissionCheck(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async findMany(
    @Form() form: FormDTO,
    @Query(QueryToControlPipe) control: ResultControlDTO,
  ): Promise<ActionDTO[]> {
    return await this.actionService.findMany(control, form);
  }

  @Get(`/:actionId`)
  @PermissionCheck(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(
    PATH_PARAMETERS.projectId,
    PATH_PARAMETERS.formId,
    PATH_PARAMETERS.actionId,
  )
  public async findOne(@Action() action: ActionDTO): Promise<ActionDTO> {
    return action;
  }

  @Post('/')
  @PermissionCheck(ACCESS_LEVEL.create, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async create(
    @Body(ActionValidatorPipe) action: ActionDTO,
    @Form() form: FormDTO,
  ): Promise<ActionDTO> {
    return await this.actionService.create(action, form);
  }

  @Put(`/:actionId`)
  @PermissionCheck(ACCESS_LEVEL.write, { form: true })
  @SwaggerParameters(
    PATH_PARAMETERS.projectId,
    PATH_PARAMETERS.formId,
    PATH_PARAMETERS.actionId,
  )
  public async update(
    @Body(ActionValidatorPipe) action: ActionDTO,
    @Form() form: FormDTO,
  ): Promise<ActionDTO> {
    return await this.actionService.update(action, form);
  }

  // #endregion Public Methods
}
