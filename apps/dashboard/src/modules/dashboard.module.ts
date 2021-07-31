import { LOG_LEVEL } from '@automagical/contracts/config';
import { APP_DEVTOOLS } from '@automagical/contracts/constants';
import { MinimalSdkModule } from '@automagical/formio-sdk';
import { MainCLIModule } from '@automagical/terminal';
import {
  AutoConfigService,
  AutomagicalConfigModule,
  LoggableModule,
  SymbolProviderModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';

import { RecentUpdatesService } from '../services';
import { DashboardService } from '../services/dashboard.service';

@Module({
  imports: [
    MinimalSdkModule,
    UtilitiesModule,
    SymbolProviderModule.forRoot(APP_DEVTOOLS),
    EventEmitterModule.forRoot(),
    MainCLIModule,
    AutomagicalConfigModule.register(APP_DEVTOOLS, {
      SKIP_CONFIG_PRINT: true,
    }),
    LoggerModule.forRootAsync({
      inject: [AutoConfigService],
      useFactory(configService: AutoConfigService) {
        return {
          pinoHttp: {
            level: configService.get(LOG_LEVEL),
          },
        };
      },
    }),
  ],
  providers: [DashboardService, RecentUpdatesService],
})
@LoggableModule(APP_DEVTOOLS)
export class DashboardModule {}
