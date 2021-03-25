import { Module } from '@nestjs/common';
import { FormioSdkModule } from '@automagical/formio-sdk';
import { UtilizationGuard } from './utilization.guard';

@Module({
  imports: [FormioSdkModule],
  exports: [UtilizationGuard],
})
export class LicensesModule {}
