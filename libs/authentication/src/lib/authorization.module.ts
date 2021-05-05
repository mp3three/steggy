import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { LocalAuthGuard } from './guards';
import { AuthService } from './services';
import { LocalStrategy } from './strategies';

const providers = [AuthService, LocalStrategy, LocalAuthGuard];
@Module({
  controllers: [],
  exports: providers,
  imports: [PassportModule, ConfigModule],
  providers: providers,
})
export class AuthorizationModule {}
