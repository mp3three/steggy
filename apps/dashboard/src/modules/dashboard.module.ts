import { APP_DASHBOARD } from '@automagical/contracts/constants';
import {
  BLESSED_GRID,
  BLESSED_SCREEN,
  Grid,
  Screen,
} from '@automagical/contracts/terminal';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { BlessedModule } from '@automagical/terminal';
import { ApplicationModule } from '@automagical/utilities';

import { BLESSED_COLORS } from '../includes';
import { StatusService } from '../services';
import { RemoteService } from '../services/remote.service';
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
      useFactory(screen: Screen) {
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
