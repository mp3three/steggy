import { EXPIRES_IN, JWT_SECRET } from '@automagical/config';
import { CacheModule, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import {
  AdminKeyGuard,
  BasicAuthGuard,
  ExistsAuthGuard,
  FormAuthGuard,
  IsAuthorizedGuard,
  JWTAuthGuard,
  ProjectAuthGuard,
  RemoteTokenGuard,
  SubmissionAuthGuard,
} from './guards';
import { AuthenticationService, RoleService } from './services';

const providers = [
  AuthenticationService,
  AdminKeyGuard,
  BasicAuthGuard,
  ExistsAuthGuard,
  IsAuthorizedGuard,
  JWTAuthGuard,
  FormAuthGuard,
  ProjectAuthGuard,
  RemoteTokenGuard,
  SubmissionAuthGuard,
  RoleService,
];
const authExports = [
  JWTAuthGuard,
  AuthenticationService,
  RoleService,
  ProjectAuthGuard,
  FormAuthGuard,
];
export class AuthenticationModule {
  // #region Public Static Methods

  public static register(CRUD_WIRING: Provider[]): DynamicModule {
    return {
      exports: authExports,
      global: true,
      imports: [
        ConfigModule,
        CacheModule.register(),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory(configService: ConfigService) {
            return {
              secret: configService.get(JWT_SECRET),
              signOptions: {
                expiresIn: configService.get(EXPIRES_IN),
              },
            };
          },
        }),
      ],
      module: AuthenticationModule,
      providers: [...providers, ...CRUD_WIRING],
    };
  }

  // #endregion Public Static Methods
}
