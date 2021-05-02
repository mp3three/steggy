import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';

@Module({
  controllers: [],
  exports: [AuthService, LocalStrategy],
  imports: [PassportModule],
  providers: [AuthService, LocalStrategy],
})
export class AuthorizationModule {}

// Note for future buildout, placed here for visibility
// https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/userpasswords.md
