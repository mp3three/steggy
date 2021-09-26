import { applyDecorators, UseGuards } from '@nestjs/common';

import { IsAuthorizedGuard } from '../guards';

export function AuthStack(): ReturnType<typeof applyDecorators> {
  const strategies = [];

  strategies.push(IsAuthorizedGuard);
  return applyDecorators(UseGuards(...strategies));
}
