import { APP_DASHBOARD } from '@automagical/contracts/constants';
import { BLESSED_SCREEN, Grid } from '@automagical/contracts/terminal';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { BlessedModule } from '@automagical/terminal';
import {
  AutomagicalConfigModule,
  CommonImports,
  LoggableModule,
  MQTTModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    UtilitiesModule.forRoot(APP_DASHBOARD, [
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
    ]),
    BlessedModule.forRoot(BLESSED_COLORS),
    ...CommonImports(),
    HomeAssistantModule,
    MQTTModule,
    AutomagicalConfigModule.register(APP_DASHBOARD),
  ],
  providers: [
    RecentUpdatesService,
    StatusService,
    LeftMenuService,
    HealthService,
    RemoteService,
    // Items that get appended to left menu
    // Currently, the order below determines the order on the menu
    LoftService,
    GamesService,
    BedroomService,
    GuestService,
    DownstairsService,
    WeatherService,
    StonksService,
  ],
})
@LoggableModule(APP_DASHBOARD)
export class DashboardModule {}
