import { CacheModule, DynamicModule } from '@nestjs/common';

import { CacheProviderService } from '../services';

export function RegisterCache(): DynamicModule {
  return CacheModule.registerAsync({
    inject: [CacheProviderService],
    useFactory(configService: CacheProviderService) {
      return configService.getConfig();
    },
  });
}
