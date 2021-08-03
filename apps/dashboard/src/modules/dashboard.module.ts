import { APP_DASHBOARD } from '@automagical/contracts/constants';
import { BLESSED_SCREEN } from '@automagical/contracts/terminal';
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

import { BLESSED_COLORS, Grid } from '../includes';
import {
  LoftService,
  PicoAliasService,
  RecentUpdatesService,
  StatusService,
} from '../services';
import { HealthService } from '../services/health.service';
import { BLESSED_GRID } from '../typings';

@Module({
  imports: [
    UtilitiesModule.forRoot(APP_DASHBOARD, [
      {
        inject: [BLESSED_SCREEN],
        provide: BLESSED_GRID,
        useFactory(screen: Widgets.Screen) {
          return new Grid({
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
    PicoAliasService,
    HealthService,
    LoftService,
  ],
})
@LoggableModule(APP_DASHBOARD)
export class DashboardModule {}
