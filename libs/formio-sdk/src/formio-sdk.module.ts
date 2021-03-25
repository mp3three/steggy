import { Module } from '@nestjs/common';
import { FormioSdkService } from './formio-sdk.service';
import { LicenseService } from './license.service';
import { ResourceService } from './resource.service';
import { SubmissionService } from './submission.service';

@Module({
  providers: [
    FormioSdkService,
    ResourceService,
    SubmissionService,
    LicenseService,
  ],
  exports: [
    FormioSdkService,
    ResourceService,
    SubmissionService,
    LicenseService,
  ],
})
export class FormioSdkModule {}
