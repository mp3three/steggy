import { FormioSdkModule } from '@automagical/formio-sdk';
import { LicensesModule } from '@automagical/licenses';
import { CacheModule, Module } from '@nestjs/common';
import RedisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { LicenseController } from './license.controller';
import { UtilizationController } from './utilization.controller';

@Module({
  controllers: [AppController, LicenseController, UtilizationController],
  imports: [
    LicensesModule,
    FormioSdkModule,
    CacheModule.register({
      host: process.env.LICENSES_REDIS_HOST,
      max: Number.POSITIVE_INFINITY,
      port: process.env.LICENSES_REDIS_PORT,
      store: RedisStore,
    }),
  ],
})
export class AppModule {}
