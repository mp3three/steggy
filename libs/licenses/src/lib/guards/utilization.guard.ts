import { LIB_LICENSES } from '@automagical/contracts/constants';
import { UtilizationResponseDTO } from '@automagical/contracts/licenses';
import {
  FormioSdkService,
  HTTP_Methods,
  LICENSE_SERVER,
} from '@automagical/formio-sdk';
import { InjectLogger } from '@automagical/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UtilizationGuard implements CanActivate {
  // #region Constructors

  constructor(
    private readonly formioSdkService: FormioSdkService,
    private readonly reflector: Reflector,
    @InjectLogger(UtilizationGuard, LIB_LICENSES)
    protected readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.get<string>('action', context.getHandler());
    const body = {
      salt: undefined,
    };

    const response = await this.formioSdkService.fetch<UtilizationResponseDTO>({
      baseUrl: this.configService.get(LICENSE_SERVER),
      body,
      method: HTTP_Methods.POST,
      params: {
        qs: '1',
      },
      url: `/utilization/${action}`,
    });
    if (typeof response === 'string') {
      this.logger.info(response);
      return false;
    }
    return true;
    // return UtilizationResponseDTO.VerifyHash(response, body);
  }

  // #endregion Public Methods
}
