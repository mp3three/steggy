import {
  FormioSdkService,
  HTTP_Methods,
  LICENSE_SERVER,
} from '@automagical/formio-sdk';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { UtilizationResponseDTO } from '@automagical/contracts/licenses';

@Injectable()
export class UtilizationGuard implements CanActivate {
  // #region Constructors

  constructor(
    private readonly formioSdkService: FormioSdkService,
    private readonly reflector: Reflector,
    @InjectPinoLogger(UtilizationGuard.name)
    protected readonly logger: PinoLogger,
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
      this.logger.info(response);
      return false;
    }
    return true;
    // return UtilizationResponseDTO.VerifyHash(response, body);
  }

  // #endregion Public Methods
}
