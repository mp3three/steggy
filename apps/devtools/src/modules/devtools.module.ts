import { ApplicationModule, UtilitiesModule } from '@automagical/boilerplate';
import { GoogleModule } from '@automagical/google';
import { CONFIG_APPLICATION_TITLE, MainCLIModule } from '@automagical/tty';
import { DiscoveryModule } from '@nestjs/core';

import {
  ChangelogService,
  DevCalendarService as DevelopmentCalendarService,
} from '../services';

@ApplicationModule({
  application: Symbol('devtools'),
  globals: [{ provide: CONFIG_APPLICATION_TITLE, useValue: 'Devtools' }],
  imports: [
    DiscoveryModule,
    MainCLIModule,
    GoogleModule,
    UtilitiesModule.forRoot(),
  ],
  providers: [ChangelogService, DevelopmentCalendarService, GoogleModule],
})
export class DevtoolsModule {}
