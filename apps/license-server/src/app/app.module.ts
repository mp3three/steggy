import { FormioSdkModule } from '@automagical/formio-sdk';
import { LicensesModule } from '@automagical/licenses';
import { CacheModule, Module } from '@nestjs/common';
import RedisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { LicenseController } from './license.controller';
import { UtilizationController } from './utilization.controller';

@Module({
  imports: [
    LicensesModule,
    FormioSdkModule,
    CacheModule.register({
      max: Number.POSITIVE_INFINITY,
      store: RedisStore,
      host: process.env.LICENSES_REDIS_HOST,
      port: process.env.LICENSES_REDIS_PORT,
    }),
  ],
  controllers: [AppController, LicenseController, UtilizationController],
})
export class AppModule {}
