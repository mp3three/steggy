import { Module } from '@nestjs/common';
import { FormioSdkModule } from '@automagical/formio-sdk';
import { UtilizationGuard } from './utilization.guard';
import { LicenseService } from './license.service';

@Module({
  imports: [FormioSdkModule],
  exports: [UtilizationGuard, LicenseService],
})
export class LicensesModule {}
