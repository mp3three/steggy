import { LIB_SERVER } from '@automagical/contracts/constants';
import { ACCESS_TYPE } from '@automagical/contracts/server';
import { InjectLogger } from '@automagical/utilities';
import {
  Controller,
  Delete,
  NotImplementedException,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';

import { PermissionScope } from '../decorators';

@Controller('/row')
@ApiTags('sheets')
@PermissionScope(ACCESS_TYPE.form)
export class GoogleSheetsController {
  // #region Constructors

  constructor(
    @InjectLogger(GoogleSheetsController, LIB_SERVER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Delete('/:rowId')
  public async delete(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/')
  public async post(): Promise<never> {
    throw new NotImplementedException();
  }

  @Put('/:rowId')
  public async put(): Promise<never> {
    throw new NotImplementedException();
  }

  // #endregion Public Methods
}
