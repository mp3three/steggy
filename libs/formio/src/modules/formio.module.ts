import { Global, Module } from '@nestjs/common';

import {
  FormioFetchService,
  FormService,
  ProjectService,
  SubmissionService,
} from '../services';

@Global()
@Module({
  exports: [FormioFetchService, SubmissionService, FormService, ProjectService],
  providers: [
    FormioFetchService,
    SubmissionService,
    FormService,
    ProjectService,
  ],
})
export class FormioSdkModule {}
