import { FormioSdkModule, LicenseService } from '@automagical/formio-sdk';
import { CacheModule, Module } from '@nestjs/common';
import { UtilizationGuard } from './guards/utilization.guard';

@Module({
  exports: [UtilizationGuard, LicenseService],
  imports: [FormioSdkModule, CacheModule.register()],
})
export class LicensesModule {}
