import { SCREEN_TITLE } from '@automagical/contracts/config';
import { APP_DASHBOARD } from '@automagical/contracts/constants';
import { HomeAssistantModule } from '@automagical/home-assistant';
import {
  AutoConfigService,
  AutomagicalConfigModule,
  CommonImports,
  LoggableModule,
  MQTTModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { Module } from '@nestjs/common';
import { program as Program, screen as Screen } from 'blessed';

import { BLESSED_COLORS } from '../includes';
import {
  ApplicationService,
  LoftService,
  PicoAliasService,
  RecentUpdatesService,
  StatusService,
} from '../services';
import { HealthService } from '../services/health.service';
import { BLESSED_SCREEN, BLESSED_THEME } from '../typings';

@Module({
  imports: [
    UtilitiesModule.forRoot(APP_DASHBOARD, [
      {
        inject: [AutoConfigService],
        provide: BLESSED_SCREEN,
        useFactory(config: AutoConfigService) {
          const program2 = Program();
          const out = Screen({
            autoPadding: true,
            program: program2,
            smartCSR: true,
            title: config.get(SCREEN_TITLE),
          });
          // Quit on Escape, q, or Control-C.
          out.key(['escape', 'q', 'C-c'], function () {
            // eslint-disable-next-line unicorn/no-process-exit
            return process.exit(0);
          });
          out.render();
          out;
          return out;
        },
      },
      {
        provide: BLESSED_THEME,
        useValue: BLESSED_COLORS,
      },
    ]),
    ...CommonImports(),
    HomeAssistantModule,
    MQTTModule,
    AutomagicalConfigModule.register(APP_DASHBOARD),
  ],
  providers: [
    ApplicationService,
    RecentUpdatesService,
    StatusService,
    PicoAliasService,
    HealthService,
    LoftService,
  ],
})
@LoggableModule(APP_DASHBOARD)
export class DashboardModule {}
