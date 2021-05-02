import { FetchModule } from '@automagical/fetch';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'cache-manager-redis-store';

import { AreaService } from './services/area.service';
import { EntityService } from './services/entity.service';
import { HomeAssistantService } from './services/home-assistant.service';
import { SocketService } from './services/socket.service';

@Module({
  exports: [HomeAssistantService, EntityService, AreaService, SocketService],
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          host: configService.get('REDIS_HOST'),
          max: Number.POSITIVE_INFINITY,
          port: configService.get('REDIS_PORT'),
          store: RedisStore,
        };
      },
    }),
    FetchModule,
  ],
  providers: [HomeAssistantService, EntityService, AreaService, SocketService],
})
export class HomeAssistantModule {}
