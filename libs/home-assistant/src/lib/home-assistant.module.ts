import { FetchModule } from '@automagical/fetch';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'cache-manager-redis-store';
import { AreaService } from './services/area.service';
import { EntityService } from './services/entity.service';
import { HomeAssistantService } from './services/home-assistant.service';
import { SocketService } from './services/socket.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          max: Infinity,
          ttl: null,
          store: RedisStore,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        };
      },
    }),
    FetchModule,
  ],
  providers: [HomeAssistantService, EntityService, AreaService, SocketService],
  exports: [HomeAssistantService, EntityService, AreaService, SocketService],
})
export class HomeAssistantModule {}
