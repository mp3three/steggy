import { APP_SQL_CONNECTOR } from '@automagical/contracts/constants';
import { FetchService, FetchWith } from '@automagical/fetch';
import { FormService } from '@automagical/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppService {
  // #region Constructors

  constructor(
    @InjectLogger(AppService, APP_SQL_CONNECTOR)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly fetchService: FetchService,
    private readonly formService: FormService,
  ) {}

  // #endregion Constructors

  // #region Private Methods

  @Trace()
  private async fetch<T>(arguments_: FetchWith = {}): Promise<T> {
    return await this.fetchService.fetch({
      baseUrl: this.configService.get('formio.project'),
      headers: {
        'x-token': this.configService.get('formio.key'),
      },
      ...arguments_,
    });
  }

  @Trace()
  private async loadResourceRoutes() {
    const forms = await this.formService.list();
  }

  @Trace()
  private async loadRouteInfo() {
    return await this.fetch({
      url: '/sqlconnector?format=v2',
    });
  }

  // #endregion Private Methods
}
