import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { FormDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { FetchWith } from '../../typings';
import { CommonID, FormioSdkService } from './formio-sdk.service';

@Injectable()
export class FormService {
  // #region Constructors

  constructor(
    @InjectLogger(FormService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    private readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * List all projects your user has access to
   */
  @Trace()
  public async list(
    arguments_: FetchWith<{ project: CommonID }>,
  ): Promise<FormDTO[]> {
    return await this.formioSdkService.fetch<FormDTO[]>({
      url: this.formioSdkService.projectUrl(arguments_.project, '/form'),
      ...arguments_,
    });
  }

  // #endregion Public Methods
}
