import { APP_API_SERVER } from '@automagical/contracts/constants';
import { FormDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger } from '@automagical/utilities';
import { Controller, Get } from '@nestjs/common';
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
  public async getForm(): Promise<FormDTO> {
    return null;
  }

  // #endregion Public Methods
}
