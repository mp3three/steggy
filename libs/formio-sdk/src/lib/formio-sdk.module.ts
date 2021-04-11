import { FetchModule } from '@automagical/fetch';
import { Module } from '@nestjs/common';
import {} from './middleware';
import { FormioSdkService } from './services/formio-sdk.service';
import { LicenseService } from './services/license.service';
import { ResourceService } from './services/resource.service';
import { SubmissionService } from './services/submission.service';

@Module({
  imports: [FetchModule],
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
