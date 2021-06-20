import { AuthStrategies } from '@automagical/authentication';
import { LIB_SERVER } from '@automagical/contracts/constants';
import {
  ACCESS_LEVEL,
  ACCESS_TYPE,
  PATH_PARAMETERS,
  SwaggerParameters,
} from '@automagical/contracts/server';
import { InjectLogger } from '@automagical/utilities';
import { Controller, Get, NotImplementedException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';

import { PermissionScope } from '../decorators';

@Controller('/project/:projectId/form/:formId/storage')
@PermissionScope(ACCESS_TYPE.form)
@ApiTags('storage')
export class FormStorageController {
  // #region Constructors

  constructor(
    @InjectLogger(FormStorageController, LIB_SERVER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('/azure')
  @AuthStrategies(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async azureGet(): Promise<never> {
    throw new NotImplementedException();
  }

  @Get('/dropbox')
  @AuthStrategies(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async dropboxGet(): Promise<never> {
    throw new NotImplementedException();
  }

  @Get('/s3')
  @AuthStrategies(ACCESS_LEVEL.read, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async s3Get(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/azure')
  @AuthStrategies(ACCESS_LEVEL.write, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async azurePost(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/dropbox')
  @AuthStrategies(ACCESS_LEVEL.write, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async dropboxPost(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/s3')
  @AuthStrategies(ACCESS_LEVEL.write, { form: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async s3Post(): Promise<never> {
    throw new NotImplementedException();
  }

  // #endregion Public Methods
}
