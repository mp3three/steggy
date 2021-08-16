import { APP_DASHBOARD } from '@automagical/contracts';
import { HomeAssistantModule } from '@automagical/home-assistant';
import {
  BlessedModule,
  HomeAssistantWorkspace,
  LoggerWorkspace,
  WeatherWorkspace,
} from '@automagical/terminal';
import { ApplicationModule } from '@automagical/utilities';

import { BLESSED_COLORS } from '../includes';
import { StatusService } from '../services';
import { LeftMenuService } from '../widgets';
import {
  BedroomWorkspace,
  DownstairsWorkspace,
  GamesWorkspace,
  GuestWorkspace,
  LoftWorkspace,
  StonksWorkspace,
} from '../workspaces';

@ApplicationModule({
  application: APP_DASHBOARD,
  dashboards: [
    // Rooms
    BedroomWorkspace,
    DownstairsWorkspace,
    GamesWorkspace,
    GuestWorkspace,
    LoftWorkspace,
    // Utilitity
    LoggerWorkspace,
    HomeAssistantWorkspace,
    // Misc
    StonksWorkspace,
    WeatherWorkspace,
  ],
  imports: [BlessedModule.forRoot(BLESSED_COLORS), HomeAssistantModule],
  providers: [StatusService, LeftMenuService],
})
export class DashboardModule {}
