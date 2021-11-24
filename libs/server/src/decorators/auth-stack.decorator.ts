import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

import { ADMIN_KEY_HEADER } from '../contracts';
import { AdminKeyGuard, IsAuthorizedGuard } from '../guards';

export function AuthStack(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    UseGuards(AdminKeyGuard, IsAuthorizedGuard),
    ApiHeader({
      description: 'Admin auth password',
      example: 'super secret password',
      name: ADMIN_KEY_HEADER,
    }),
  );
}
