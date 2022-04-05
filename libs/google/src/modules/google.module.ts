import { LibraryModule } from '@automagical/boilerplate';

import {
  API_KEY,
  AUTH_TOKEN,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL,
} from '../config';
import { AuthService, CalendarService } from '../services';

@LibraryModule({
  configuration: {
    [API_KEY]: {
      description: 'For authentication',
      type: 'string',
    },
    [AUTH_TOKEN]: {
      description: 'For authentication',
      type: 'string',
    },
    [CLIENT_ID]: {
      description: 'For authentication',
      type: 'string',
    },
    [CLIENT_SECRET]: {
      description: 'For authentication',
      type: 'string',
    },
    [REDIRECT_URL]: {
      description: 'For authentication',
      type: 'string',
    },
  },
  exports: [CalendarService, AuthService],
  library: Symbol('google'),
  providers: [CalendarService, AuthService],
})
export class GoogleModule {}
