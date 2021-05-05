import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { BasicAuthGuard } from './guards';
import { AuthService } from './services';

const providers = [AuthService, BasicAuthGuard];
@Module({
  controllers: [],
  exports: providers,
  imports: [PassportModule, ConfigModule],
  providers: providers,
})
export class AuthorizationModule {}
