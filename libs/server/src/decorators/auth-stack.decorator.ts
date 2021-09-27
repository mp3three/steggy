import { applyDecorators, UseGuards } from '@nestjs/common';

import { AdminKeyGuard, IsAuthorizedGuard } from '../guards';

export function AuthStack(): ReturnType<typeof applyDecorators> {
  return UseGuards(AdminKeyGuard, IsAuthorizedGuard);
}
