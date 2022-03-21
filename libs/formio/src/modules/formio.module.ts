import { LibraryModule } from '@automagical/boilerplate';

import { API_KEY, JWT_TOKEN, LIB_FORMIO, LIVE_ENDPOINT } from '../config';
import {
  FormioFetchService,
  FormService,
  ProjectService,
  SubmissionService,
} from '../services';

@LibraryModule({
  configuration: {
    [API_KEY]: {
      description: 'x-token to for authentication',
      type: 'string',
    },
    [JWT_TOKEN]: {
      description: 'Auth token to use with scripts',
      type: 'string',
    },
    [LIVE_ENDPOINT]: {
      description: 'Live endpoint for project',
      type: 'string',
    },
  },
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
