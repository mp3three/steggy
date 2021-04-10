import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';

@Module({
  controllers: [],
  imports: [PassportModule],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService, LocalStrategy],
})
export class AuthorizationModule {}

// Note for future buildout, placed here since it won't be missed
// https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/userpasswords.md
