import { FetchModule } from '@automagical/fetch';
import { Module } from '@nestjs/common';

import { FormService } from './services';
import { FormioSdkService } from './services/formio-sdk.service';
import { LicenseService } from './services/license.service';
import { ResourceService } from './services/resource.service';
import { SubmissionService } from './services/submission.service';

@Module({
  exports: [
    FormioSdkService,
    ResourceService,
    SubmissionService,
    LicenseService,
    FormService,
  ],
  imports: [FetchModule],
  providers: [
    FormioSdkService,
    ResourceService,
    SubmissionService,
    LicenseService,
    FormService,
  ],
})
export class FormioSdkModule {}
