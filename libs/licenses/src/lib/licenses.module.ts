import { FormioSdkModule, LicenseService } from '@automagical/formio-sdk';
import { CacheModule, Module } from '@nestjs/common';
import { UtilizationGuard } from './guards/utilization.guard';

@Module({
  imports: [FormioSdkModule, CacheModule.register()],
  exports: [UtilizationGuard, LicenseService],
})
export class LicensesModule {}
