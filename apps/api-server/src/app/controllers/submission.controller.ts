import { APP_API_SERVER } from '@automagical/contracts/constants';
import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { FetchForm, Form } from '@automagical/formio-sdk';
import { InjectLogger } from '@automagical/utilities';
import { Controller, Get } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Controller()
export class SubmissionController {
  // #region Constructors

  constructor(
    @InjectLogger(SubmissionController, APP_API_SERVER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('/project/:projectId/:formId')
  @FetchForm()
  public async getForm(@Form() form: SubmissionDTO): Promise<SubmissionDTO> {
    return form;
  }

  // #endregion Public Methods
}
