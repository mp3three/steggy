import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // #region Public Methods

  public async validateUser(username: string, pass: string): Promise<any> {
    return null;
  }

  // #endregion Public Methods
}
