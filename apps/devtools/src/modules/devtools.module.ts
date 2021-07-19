import { FormCRUD, ProjectCRUD, SubmissionCRUD } from '@automagical/contracts';
import { LOG_LEVEL, UTILS_AWS } from '@automagical/contracts/config';
import { APP_DEVTOOLS } from '@automagical/contracts/constants';
import {
  FormService,
  MinimalSdkModule,
  ProjectService,
  SubmissionService,
} from '@automagical/formio-sdk';
import {
  AWSService,
  ChangelogREPL,
  ConfigBuilderREPL,
  MainCLIModule,
} from '@automagical/terminal';
import {
  ConfigModule,
  EBSModule,
  S3Module,
  SymbolProviderModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';

import { DeployREPL } from '../services/deploy.repl';

@Module({
  imports: [
    MinimalSdkModule,
    UtilitiesModule,

    EventEmitterModule.forRoot(),
    MainCLIModule.selectServices([
      AWSService,
      ConfigBuilderREPL,
      ChangelogREPL,
      DeployREPL,
    ]),
    ConfigModule.register(APP_DEVTOOLS, {
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
    SymbolProviderModule.forRoot([
      {
        provide: ProjectCRUD,
        useClass: ProjectService,
      },
      {
        provide: FormCRUD,
        useClass: FormService,
      },
      {
        provide: SubmissionCRUD,
        useClass: SubmissionService,
      },
    ]),
  ],
  providers: [DeployREPL],
})
export class DevtoolsModule {}
