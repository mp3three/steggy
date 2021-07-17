import { FormCRUD, ProjectCRUD, SubmissionCRUD } from '@formio/contracts';
import { LOG_LEVEL, UTILS_AWS } from '@formio/contracts/config';
import { APP_DEVTOOLS } from '@formio/contracts/constants';
import {
  FormService,
  MinimalSdkModule,
  ProjectService,
  SubmissionService,
} from '@formio/formio-sdk';
import {
  AWSService,
  ChangelogREPL,
  ConfigBuilderREPL,
  MainCLIModule,
} from '@formio/terminal';
import {
  ConfigModule,
  EBSModule,
  S3Module,
  SymbolProviderModule,
  UtilitiesModule,
} from '@formio/utilities';
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
