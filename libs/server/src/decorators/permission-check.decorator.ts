import { AuthOptions, AuthStrategies } from '@automagical/authentication';
import {
  ACCESS_LEVEL,
  ACCESS_TYPE,
  SERVER_METADATA,
} from '@automagical/contracts/server';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { ValidateParametersGuard } from '../guards';

export function PermissionCheck(
  level: ACCESS_LEVEL,
  options: AuthOptions,
): MethodDecorator {
  return applyDecorators(AuthStrategies(level, options));
}

export const PermissionScope = (type?: ACCESS_TYPE): ClassDecorator => {
  const decorators = [UseGuards(ValidateParametersGuard)];
  if (type) {
    decorators.push(SetMetadata(SERVER_METADATA.ACCESS_TYPE, type));
  }
  return applyDecorators(...decorators);
};
