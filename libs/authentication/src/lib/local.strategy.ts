import { Injectable, NotImplementedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // #region Constructors

  constructor(private authService: AuthService) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  public async validate(username: string, password: string): Promise<unknown> {
    // const user = await this.authService.validateUser(username, password);
    // if (!user) {
    //   throw new ForbiddenException();
    // }
    // return user;
    username;
    password;
    throw new NotImplementedException();
  }

  // #endregion Public Methods
}
