import {
  FetchUserdataMiddleware,
  FormioSdkModule,
} from '@automagical/formio-sdk';
import { LicensesModule } from '@automagical/licenses';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { LicenseController } from './license.controller';
import { UtilizationController } from './utilization.controller';

@Module({
  imports: [LicensesModule, FormioSdkModule],
  controllers: [AppController, LicenseController, UtilizationController],
})
export class AppModule {}
