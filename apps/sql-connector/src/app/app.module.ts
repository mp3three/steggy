import { ConfigModule } from '@automagical/config';
import { FetchModule } from '@automagical/fetch';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnexModule } from 'nestjs-knex';
import { LoggerModule } from 'nestjs-pino';

import { ConnectorController } from './controllers/connector.controller';
import { AppService } from './services/app.service';

@Module({
  controllers: [ConnectorController],
  imports: [
    FetchModule,
    ConfigModule.register('sql-connector'),
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
        config: configService.get('knex'),
      }),
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
