import { AuthenticationModule } from '@automagical/authentication';
import {
  CacheModule,
  DynamicModule,
  MiddlewareConsumer,
  Provider,
  RequestMethod,
} from '@nestjs/common';

import {
  ActionController,
  FormController,
  FormStorageController,
  GoogleSheetsController,
  ProjectController,
  RoleController,
  SubmissionController,
} from './controllers';
import { ValidateParametersGuard } from './guards';
import { InitMiddleware } from './middleware';
import { UrlRewriteMiddleware } from './middleware/url-rewrite.middleware';
import { ValidatorService } from './services';

export class ServerModule {
  // #region Public Static Methods

  public static register(CRUD_WIRING: Provider[]): DynamicModule {
    return {
      imports: [CacheModule.register()],
      module: ServerModule,
      providers: [
        InitMiddleware,
        ValidatorService,
        ValidateParametersGuard,
        ...CRUD_WIRING,
      ],
    };
  }

  public static withControllers(CRUD_WIRING: Provider[]): DynamicModule {
    return {
      controllers: [
        RoleController,
        ActionController,
        FormController,
        ProjectController,
        FormStorageController,
        GoogleSheetsController,
        SubmissionController,
      ],
      exports: [UrlRewriteMiddleware],
      imports: [
        CacheModule.register(),
        AuthenticationModule.register(CRUD_WIRING),
      ],
      module: ServerModule,
      providers: [
        InitMiddleware,
        ValidatorService,
        UrlRewriteMiddleware,
        ValidateParametersGuard,
        ...CRUD_WIRING,
      ],
    };
  }

  // #endregion Public Static Methods

  // #region Public Methods

  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(InitMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }

  // #endregion Public Methods
}
