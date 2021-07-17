import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  FormioSdkService,
  FormService,
  ProjectService,
  SubmissionService,
  UserService,
} from '../services';

@Global()
@Module({
  exports: [
    FormioSdkService,
    SubmissionService,
    FormService,
    ProjectService,
    UserService,
  ],
  imports: [ConfigModule],
  providers: [
    FormioSdkService,
    SubmissionService,
    FormService,
    ProjectService,
    UserService,
  ],
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
