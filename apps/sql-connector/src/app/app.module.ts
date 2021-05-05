import { ConfigModule } from '@automagical/config';
import { FetchModule } from '@automagical/fetch';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { ConnectorController } from './controllers/connector.controller';

@Module({
  controllers: [ConnectorController],
  imports: [
    FetchModule,
    ConfigModule.register('sql-connector', {
      LOG_LEVEL: 'info',
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
  ],
  providers: [],
})
export class AppModule {}
