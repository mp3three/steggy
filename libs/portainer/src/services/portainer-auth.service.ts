import {
  AuthenticatePayloadDTO,
  AuthenticateResponseDTO,
  OAuthPayloadDTO,
} from '@automagical/contracts/portainer';
import { FetchWith } from '@automagical/contracts/utilities';
import { Debug } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { PortainerFetchService } from './portainer-fetch.service';

@Injectable()
export class PortainerAuthService {
  // #region Object Properties

  public jwt: string;

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly fetchService: PortainerFetchService) {}

  // #endregion Constructors

  // #region Public Methods

  @Debug('Login')
  public async login({
    username,
    password,
    ...fetchWith
  }: FetchWith<AuthenticatePayloadDTO>): Promise<void> {
    const response = await this.fetchService.fetch<AuthenticateResponseDTO>({
      body: {
        password,
        username,
      },
      method: 'post',
      url: '/auth',
      ...fetchWith,
    });
    this.jwt = response.jwt;
  }

  @Debug('Logout')
  public async logout(): Promise<void> {
    return await this.fetchService.fetch({
      method: 'post',
      url: `/auth/logout`,
    });
  }

  @Debug('Oauth')
  public async oauth({
    code,
    ...fetchWith
  }: FetchWith<OAuthPayloadDTO>): Promise<void> {
    const response = await this.fetchService.fetch<AuthenticateResponseDTO>({
      body: {
        code,
      },
      method: 'post',
      url: '/auth/oauth/validate',
      ...fetchWith,
    });
    this.jwt = response.jwt;
  }

  // #endregion Public Methods
}
