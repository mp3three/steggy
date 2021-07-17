import { EXPIRES_IN, JWT_SECRET } from '@automagical/contracts/config';
import { CacheModule, Global, Module } from '@nestjs/common';
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
} from '../guards';
import { AuthenticationService, RoleService } from '../services';

@Global()
@Module({
  exports: [
    JWTAuthGuard,
    AuthenticationService,
    RoleService,
    ProjectAuthGuard,
    FormAuthGuard,
  ],
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
  providers: [
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
  ],
})
export class AuthenticationModule {}
