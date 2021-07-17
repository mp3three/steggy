import { applyDecorators, CacheTTL, UseInterceptors } from '@nestjs/common';

import { HttpCacheInterceptor } from '../interceptors';

export function CacheRoute(): MethodDecorator {
  return applyDecorators(
    UseInterceptors(HttpCacheInterceptor),
    CacheTTL(60 * 5),
  );
}
