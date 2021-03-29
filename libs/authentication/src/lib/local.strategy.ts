import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // #region Constructors

  constructor(private authService: AuthService) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  public async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new ForbiddenException();
    }
    return user;
  }

  // #endregion Public Methods
}
