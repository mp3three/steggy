import { FetchModule } from '@automagical/fetch';
import { Module } from '@nestjs/common';

import {} from './middleware';
import { LoadFormMiddleware } from './middleware/load-form.middleware';
import { FormioSdkService } from './services/formio-sdk.service';
import { LicenseService } from './services/license.service';
import { ResourceService } from './services/resource.service';
import { SubmissionService } from './services/submission.service';

@Module({
  exports: [
    FormioSdkService,
    LoadFormMiddleware,
    ResourceService,
    SubmissionService,
    LicenseService,
  ],
  imports: [FetchModule],
  providers: [
    FormioSdkService,
    ResourceService,
    SubmissionService,
    LoadFormMiddleware,
    LicenseService,
  ],
})
export class FormioSdkModule {}
