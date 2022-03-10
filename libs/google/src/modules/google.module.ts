import { LibraryModule } from '@automagical/boilerplate';
import { AuthService, CalendarService } from '../services';

@LibraryModule({
  exports: [CalendarService, AuthService],
  library: Symbol('google'),
  providers: [CalendarService, AuthService],
})
export class GoogleModule {}
