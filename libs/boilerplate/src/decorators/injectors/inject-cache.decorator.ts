import { CACHE_MANAGER, Inject } from '@nestjs/common';

export function InjectCache(): ReturnType<typeof Inject> {
  return Inject(CACHE_MANAGER);
}
