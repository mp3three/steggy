import { Module, Global } from '@nestjs/common';
import { EntityService } from './entity.service';
import { HomeAssistantService } from './home-assistant.service';
import { RoomService } from './room.service';
import { SocketService } from './socket.service';

@Global()
@Module({
  controllers: [],
  providers: [HomeAssistantService, EntityService, RoomService, SocketService],
  exports: [HomeAssistantService, EntityService, RoomService, SocketService],
})
export class HomeAssistantModule {}
