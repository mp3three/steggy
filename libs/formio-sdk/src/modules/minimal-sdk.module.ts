import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { LibraryModule } from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';

import {
  FormioSdkService,
  FormService,
  ProjectService,
  SubmissionService,
} from '../services';

@LibraryModule({
  exports: [FormioSdkService, SubmissionService, FormService, ProjectService],
  library: LIB_FORMIO_SDK,
  providers: [FormioSdkService, SubmissionService, FormService, ProjectService],
})
export class MinimalSdkModule {
  // #region Public Static Methods

  public static minimal(): DynamicModule {
    return {
      exports: [
        FormioSdkService,
        SubmissionService,
        FormService,
        ProjectService,
      ],
      global: true,
      module: MinimalSdkModule,
      providers: [
        FormioSdkService,
        SubmissionService,
        FormService,
        ProjectService,
      ],
    };
  }

  // #endregion Public Static Methods
}
