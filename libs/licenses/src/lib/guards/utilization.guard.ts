import { FormioSdkService, HTTP_Methods } from '@automagical/formio-sdk';
import { Logger } from '@automagical/logger';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UtilizationResponseDTO } from '../dto';

@Injectable()
export class UtilizationGuard implements CanActivate {
  // #region Object Properties

  private readonly logger = Logger(UtilizationGuard);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly formioSdkService: FormioSdkService,
    private readonly reflector: Reflector,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async canActivate(context: ExecutionContext) {
    const action = this.reflector.get<string>('action', context.getHandler());
    const body = {
      salt: null,
    };

    const response = await this.formioSdkService.fetch<UtilizationResponseDTO>({
      baseUrl: process.env.FORMIO_SDK_LICENSE_SERVER_base_url,
      url: `/utilization/${action}`,
      method: HTTP_Methods.POST,
      params: {
        qs: '1',
      },
      body,
    });
    if (typeof response === 'string') {
      this.logger.notice(response);
      return false;
    }
    return UtilizationResponseDTO.VerifyHash(response, body);
  }

  // #endregion Public Methods
}
