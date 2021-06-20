import {
  CacheModule,
  DynamicModule,
  Global,
  Module,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  FormioSdkService,
  FormService,
  MemberService,
  ProjectService,
  SubmissionService,
  TeamService,
  UserService,
} from './services';
import { PortalEventsService } from './services/portal-events.service';

@Global()
@Module({
  exports: [FormioSdkService, SubmissionService, FormService, ProjectService],
  imports: [ConfigModule],
  providers: [
    FormioSdkService,
    PortalEventsService,
    SubmissionService,
    FormService,
    ProjectService,
  ],
})
export class FormioSdkModule {
  // #region Public Static Methods

  public static register(CRUD_WIRING: Provider[], full = true): DynamicModule {
    const extras = full ? [TeamService, MemberService, UserService] : [];
    return {
      exports: [
        FormioSdkService,
        SubmissionService,
        FormService,
        ProjectService,
        ...extras,
      ],
      imports: [ConfigModule, CacheModule.register()],
      module: FormioSdkModule,
      providers: [
        FormioSdkService,
        SubmissionService,
        FormService,
        ProjectService,
        PortalEventsService,
        ...extras,
        ...CRUD_WIRING,
      ],
    };
  }

  // #endregion Public Static Methods
}
