import { SCREEN_TITLE } from '@automagical/contracts/config';
import { APP_DASHBOARD } from '@automagical/contracts/constants';
import { HomeAssistantModule } from '@automagical/home-assistant';
import {
  AutoConfigService,
  AutomagicalConfigModule,
  CommonImports,
  LoggableModule,
  MQTTModule,
  SymbolProviderModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { Module } from '@nestjs/common';
import { program as Program, screen as Screen } from 'blessed';

import { BLESSED_COLORS, BlessedTheme } from '../includes';
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
        inject: [AutoConfigService, BLESSED_THEME],
        provide: BLESSED_SCREEN,
        useFactory(config: AutoConfigService, { program }: BlessedTheme) {
          const program2 = Program();
          program2.bg(program.bg);
          program2.fg(program.fg);
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
