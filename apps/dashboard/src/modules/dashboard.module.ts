import { APP_DASHBOARD } from '@automagical/contracts/constants';
import { BLESSED_SCREEN, Grid } from '@automagical/contracts/terminal';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { BlessedModule } from '@automagical/terminal';
import { ApplicationModule } from '@automagical/utilities';
import { Widgets } from 'blessed';

import { BLESSED_COLORS } from '../includes';
import { StatusService } from '../services';
import { RemoteService } from '../services/remote.service';
import { BLESSED_GRID } from '../typings';
import {
  HealthService,
  LeftMenuService,
  RecentUpdatesService,
} from '../widgets';
import {
  BedroomService,
  DownstairsService,
  GamesService,
  GuestService,
  LoftService,
  StonksService,
  WeatherService,
} from '../workspaces';

@ApplicationModule({
  application: APP_DASHBOARD,
  dashboards: [
    LoftService,
    GamesService,
    BedroomService,
    GuestService,
    DownstairsService,
    WeatherService,
    StonksService,
  ],
  globals: [
    {
      inject: [BLESSED_SCREEN],
      provide: BLESSED_GRID,
      useFactory(screen: Widgets.Screen) {
        return new Grid({
          // Bad typescript definitions
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          color: 'white',
          cols: 12,
          rows: 12,
          screen,
        });
      },
    },
  ],
  imports: [BlessedModule.forRoot(BLESSED_COLORS), HomeAssistantModule],
  providers: [
    RecentUpdatesService,
    StatusService,
    LeftMenuService,
    HealthService,
    RemoteService,
  ],
})
export class DashboardModule {}
