import { ACCESS_LEVEL, SERVER_METADATA } from '@formio/contracts/server';
import {
  applyDecorators,
  Header,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';

import {
  AdminKeyGuard,
  ExistsAuthGuard,
  FormAuthGuard,
  IsAuthorizedGuard,
  JWTAuthGuard,
  ProjectAuthGuard,
  RemoteTokenGuard,
  SubmissionAuthGuard,
} from '../guards';
import { TeamGuard } from '../guards/team.guard';

export type AuthOptions = {
  jwt?: boolean;
  apiKey?: boolean;
  basic?: boolean;
  remoteToken?: boolean;
  adminKey?: boolean;
  project?: boolean;
  exists?: boolean;
  form?: boolean;
  submission?: boolean;
  team?: boolean;
};
export const AuthStrategies = (
  level: ACCESS_LEVEL,
  options: AuthOptions,
): MethodDecorator => {
  options = {
    adminKey: true,
    apiKey: true,
    basic: false,
    exists: false,
    jwt: true,
    remoteToken: true,
    team: true,
    ...options,
  };
  const strategies = [];
  const extras = [];
  // Guards that load data into locals
  if (options.jwt) {
    strategies.push(JWTAuthGuard);
  }
  if (options.remoteToken) {
    strategies.push(RemoteTokenGuard);
  }
  if (options.adminKey) {
    strategies.push(AdminKeyGuard);
  }
  if (options.team) {
    strategies.push(TeamGuard);
  }

  // Categories
  if (options.project) {
    strategies.push(ProjectAuthGuard);
  }
  if (options.form) {
    strategies.push(ProjectAuthGuard, FormAuthGuard);
  }
  if (options.submission) {
    strategies.push(SubmissionAuthGuard);
  }

  // One-offs
  if (options.exists) {
    strategies.push(ExistsAuthGuard);
  }

  // TODO: is this needed?
  if (level !== ACCESS_LEVEL.read) {
    extras.push(Header('Cache-Control', 'none'));
  }
  strategies.push(IsAuthorizedGuard);
  extras.push(SetMetadata(SERVER_METADATA.ACCESS_LEVEL, level));
  return applyDecorators(UseGuards(...strategies), ...extras);
};
