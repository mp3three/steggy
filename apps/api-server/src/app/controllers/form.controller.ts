import { APP_API_SERVER } from '@automagical/contracts/constants';
import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { FetchForm, Form } from '@automagical/formio-sdk';
import { InjectLogger } from '@automagical/utilities';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Controller()
export class FormController {
  // #region Constructors

  constructor(
    @InjectLogger(FormController, APP_API_SERVER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('/project/:projectId/:formId')
  @FetchForm()
  public async getForm(@Form() form: SubmissionDTO): Promise<SubmissionDTO> {
    return form;
  }

  @Post('/project/:projectId/:formId')
  public async createForm(@Body() form: SubmissionDTO): Promise<SubmissionDTO> {
    return form;
  }

  // #endregion Public Methods
}