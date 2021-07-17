import {
  AreaService,
  EntityService,
  HomeAssistantService,
  SocketService,
} from '@automagical/home-assistant';
import { CacheModule, Module } from '@nestjs/common';

@Module({
  exports: [HomeAssistantService, EntityService, AreaService, SocketService],
  imports: [CacheModule],
  providers: [HomeAssistantService, EntityService, AreaService, SocketService],
})
export class HomeAssistantModule {}
