import { AuthorizationModule } from '@automagical/authentication';
import { ConfigModule } from '@automagical/config';
import { FetchModule } from '@automagical/fetch';
import { FormioSdkModule } from '@automagical/formio-sdk';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { KnexModule } from 'nestjs-knex';
import { LoggerModule } from 'nestjs-pino';

import { CONFIG_KNEX } from '../typings';
import { ConnectorController } from './controllers/connector.controller';
import { AppService } from './services/app.service';

@Module({
  controllers: [ConnectorController],
  imports: [
    FormioSdkModule,
    PassportModule,
    FetchModule,
    AuthorizationModule,
    ConfigModule.register<Record<string, unknown>>('sql-connector', {
      application: {
        knex: {
          client: 'sqlite3',
          connection: ':memory:',
          useNullAsDefault: true,
        },
      },
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          pinoHttp: {
            level: configService.get('LOG_LEVEL'),
          },
        };
      },
    }),
    KnexModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: configService.get(CONFIG_KNEX),
      }),
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
