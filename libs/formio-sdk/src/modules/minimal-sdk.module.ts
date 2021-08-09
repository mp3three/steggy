import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { LibraryModule } from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  FormioSdkService,
  FormService,
  ProjectService,
  SubmissionService,
} from '../services';

@LibraryModule({
  exports: [FormioSdkService, SubmissionService, FormService, ProjectService],
  imports: [ConfigModule],
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
      imports: [ConfigModule],
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
