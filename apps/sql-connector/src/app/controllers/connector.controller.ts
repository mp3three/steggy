import { BasicAuthGuard } from '@automagical/authentication';
import { APP_SQL_CONNECTOR } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import {
  Controller,
  Delete,
  Get,
  Next,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

import { AppService } from '../services/app.service';

@Controller('sqlconnector')
export class ConnectorController {
  // #region Constructors

  constructor(
    @InjectLogger(ConnectorController, APP_SQL_CONNECTOR)
    private readonly logger: PinoLogger,
    private readonly appService: AppService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @UseGuards(BasicAuthGuard)
  @Get('/refresh')
  public async refresh(): Promise<void> {
    await this.appService.refresh();
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  @Post()
  @Delete()
  @Put()
  public async callThrough(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.appService.router(request, response, next);
  }

  // #endregion Public Methods
}
