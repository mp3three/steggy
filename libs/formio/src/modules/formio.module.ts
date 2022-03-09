import { LibraryModule } from '@automagical/boilerplate';
import { Global, Module } from '@nestjs/common';
import { LIB_FORMIO } from '../config';

import {
  FormioFetchService,
  FormService,
  ProjectService,
  SubmissionService,
} from '../services';

@LibraryModule({
  exports: [FormioFetchService, SubmissionService, FormService, ProjectService],
  library: LIB_FORMIO,
  providers: [
    FormioFetchService,
    SubmissionService,
    FormService,
    ProjectService,
  ],
})
export class FormioSdkModule {}
