import { APP_DASHBOARD } from '@automagical/contracts/constants';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { BlessedModule } from '@automagical/terminal';
import { ApplicationModule } from '@automagical/utilities';

import { BLESSED_COLORS } from '../includes';
import { StatusService } from '../services';
import {
  HealthService,
  LeftMenuService,
  RecentUpdatesService,
} from '../widgets';
import {
  BedroomWorkspace,
  DownstairsWorkspace,
  GamesWorkspace,
  GuestWorkspace,
  LoftWorkspace,
  LoggerWorkspace,
  StonksWorkspace,
  WeatherWorkspace,
} from '../workspaces';

@ApplicationModule({
  application: APP_DASHBOARD,
  dashboards: [
    LoggerWorkspace,
    LoftWorkspace,
    BedroomWorkspace,
    DownstairsWorkspace,
    GamesWorkspace,
    GuestWorkspace,
    StonksWorkspace,
    WeatherWorkspace,
  ],
  globals: [],
  imports: [BlessedModule.forRoot(BLESSED_COLORS), HomeAssistantModule],
  providers: [
    RecentUpdatesService,
    StatusService,
    LeftMenuService,
    HealthService,
  ],
})
export class DashboardModule {}
