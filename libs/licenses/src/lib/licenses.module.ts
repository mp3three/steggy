import { FormioSdkModule, LicenseService } from '@automagical/formio-sdk';
import { CacheModule, Module } from '@nestjs/common';
import * as RedisStore from 'cache-manager-redis-store';
import { UtilizationGuard } from './guards/utilization.guard';

@Module({
  imports: [
    FormioSdkModule,
    CacheModule.register({
      max: Infinity,
      ttl: null,
      store: RedisStore,
      host: process.env.LICENSES_REDIS_HOST,
      port: process.env.LICENSES_REDIS_PORT,
    }),
  ],
  exports: [UtilizationGuard, LicenseService],
})
export class LicensesModule {}
