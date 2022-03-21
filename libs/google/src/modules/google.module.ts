import { LibraryModule } from '@automagical/boilerplate';
import {
  API_KEY,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL,
  AUTH_TOKEN,
} from '../config';
import { AuthService, CalendarService } from '../services';

@LibraryModule({
  configuration: {
    [API_KEY]: {
      type: 'string',
      description: 'For authentication',
    },
    [CLIENT_ID]: {
      type: 'string',
      description: 'For authentication',
    },
    [CLIENT_SECRET]: {
      type: 'string',
      description: 'For authentication',
    },
    [REDIRECT_URL]: {
      type: 'string',
      description: 'For authentication',
    },
    [AUTH_TOKEN]: {
      type: 'string',
      description: 'For authentication',
    },
  },
  exports: [CalendarService, AuthService],
  library: Symbol('google'),
  providers: [CalendarService, AuthService],
})
export class GoogleModule {}
