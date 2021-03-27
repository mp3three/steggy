import { Module } from '@nestjs/common';
import { FormioSdkModule, LicenseService } from '@automagical/formio-sdk';
import { UtilizationGuard } from './guards/utilization.guard';
import { RedisService } from './services/redis.service';

@Module({
  imports: [FormioSdkModule],
  exports: [UtilizationGuard, LicenseService],
  providers: [RedisService],
})
export class LicensesModule {}
