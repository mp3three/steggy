import { LIB_SERVER } from '@automagical/contracts/constants';
import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { APIRequest } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
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
