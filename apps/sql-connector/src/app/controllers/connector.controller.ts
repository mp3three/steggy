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

@Controller()
@UseGuards(BasicAuthGuard)
export class ConnectorController {
  // #region Constructors

  constructor(
    @InjectLogger(ConnectorController, APP_SQL_CONNECTOR)
    private readonly logger: PinoLogger,
    private readonly appService: AppService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Delete()
  public async callThroughDelete(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.appService.router(request, response, next);
  }

  @Get()
  public async callThroughGet(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.appService.router(request, response, next);
  }

  @Get('/refresh')
  public async refresh(): Promise<void> {
    await this.appService.refresh();
  }

  @Post()
  public async callThroughPost(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.appService.router(request, response, next);
  }

  @Put()
  public async callThroughPut(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.appService.router(request, response, next);
  }

  // #endregion Public Methods
}
