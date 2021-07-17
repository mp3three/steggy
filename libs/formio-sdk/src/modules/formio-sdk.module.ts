import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  ActionService,
  FormioSdkService,
  FormService,
  MemberService,
  ProjectService,
  SubmissionService,
  TeamService,
  UserService,
} from '../services';

@Global()
@Module({
  exports: [
    ActionService,
    FormioSdkService,
    SubmissionService,
    FormService,
    ProjectService,
    TeamService,
    MemberService,
    UserService,
  ],
  imports: [ConfigModule],
  providers: [
    ActionService,
    FormioSdkService,
    SubmissionService,
    FormService,
    ProjectService,
    TeamService,
    MemberService,
    UserService,
  ],
})
export class FormioSdkModule {
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
      module: FormioSdkModule,
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
