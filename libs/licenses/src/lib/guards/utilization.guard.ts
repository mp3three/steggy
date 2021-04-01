import {
  FormioSdkService,
  HTTP_Methods,
  LICENSE_SERVER,
} from '@automagical/formio-sdk';
import { Logger } from '@automagical/logger';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UtilizationResponseDTO } from '@automagical/contracts';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UtilizationGuard implements CanActivate {
  // #region Object Properties

  private readonly logger = Logger(UtilizationGuard);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly formioSdkService: FormioSdkService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.get<string>('action', context.getHandler());
    const body = {
      salt: null,
    };

    const response = await this.formioSdkService.fetch<UtilizationResponseDTO>({
      baseUrl: this.configService.get(LICENSE_SERVER),
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
    return true;
    // return UtilizationResponseDTO.VerifyHash(response, body);
  }

  // #endregion Public Methods
}
