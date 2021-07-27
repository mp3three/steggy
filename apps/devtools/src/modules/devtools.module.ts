import { LOG_LEVEL } from '@automagical/contracts/config';
import { APP_DEVTOOLS } from '@automagical/contracts/constants';
import { MinimalSdkModule } from '@automagical/formio-sdk';
import { MainCLIModule } from '@automagical/terminal';
import {
  AutomagicalConfigModule,
  LoggableModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';

import { YoinkService } from '../services';

@Module({
  imports: [
    MinimalSdkModule,
    UtilitiesModule,

    EventEmitterModule.forRoot(),
    MainCLIModule,
    AutomagicalConfigModule.register(APP_DEVTOOLS, {
      SKIP_CONFIG_PRINT: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          pinoHttp: {
            level: configService.get(LOG_LEVEL, 'trace'),
          },
        };
      },
    }),
  ],
  providers: [YoinkService],
})
@LoggableModule(APP_DEVTOOLS)
export class DevtoolsModule {}
