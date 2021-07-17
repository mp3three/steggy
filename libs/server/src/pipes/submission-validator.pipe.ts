import { LIB_SERVER } from '@formio/contracts/constants';
import { SubmissionDTO } from '@formio/contracts/formio-sdk';
import { APIRequest } from '@formio/contracts/server';
import { InjectLogger, Trace } from '@formio/utilities';
import { Inject, Injectable, PipeTransform, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { ValidatorService } from '../services';

@Injectable({ scope: Scope.REQUEST })
export class SubmissionValidatorPipe implements PipeTransform {
  // #region Constructors

  constructor(
    @InjectLogger(SubmissionValidatorPipe, LIB_SERVER)
    protected readonly logger: PinoLogger,
    @Inject(APIRequest)
    private readonly request: APIRequest<SubmissionDTO>,
    private readonly validatorService: ValidatorService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async transform(value: SubmissionDTO): Promise<SubmissionDTO> {
    return await this.validatorService.validateSubmission(value, this.request);
  }

  // #endregion Public Methods
}
