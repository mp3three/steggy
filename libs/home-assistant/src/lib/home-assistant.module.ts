import { FetchModule } from '@automagical/fetch';
import { CacheModule, Module } from '@nestjs/common';
import { EntityService } from './services/entity.service';
import { HomeAssistantService } from './services/home-assistant.service';
import { RoomService } from './services/room.service';
import { SocketService } from './services/socket.service';

@Module({
  imports: [CacheModule.register(), FetchModule],
  providers: [HomeAssistantService, EntityService, RoomService, SocketService],
  exports: [HomeAssistantService, EntityService, RoomService, SocketService],
})
export class HomeAssistantModule {}
