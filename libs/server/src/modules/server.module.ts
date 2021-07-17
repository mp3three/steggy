import { AuthenticationModule } from '@automagical/authentication';
import {
  CacheModule,
  Global,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';

import { InitMiddleware } from '../middleware';
import {
  FormioJSValidationService,
  ProxyProjectService,
  ProxySubmissionService,
  ValidatorService,
} from '../services';

@Global()
@Module({
  exports: [
    ValidatorService,
    FormioJSValidationService,
    ProxyProjectService,
    ProxySubmissionService,
  ],
  imports: [AuthenticationModule, CacheModule.register()],
  providers: [
    ValidatorService,
    FormioJSValidationService,
    ProxyProjectService,
    ProxySubmissionService,
  ],
})
export class ServerModule {
  // #region Public Methods

  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(InitMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }

  // #endregion Public Methods
}
