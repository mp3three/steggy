import { Module } from '@nestjs/common';
import { HomeAssistantService } from './home-assistant.service';
import { EntityService } from './entity.service';
import { RoomService } from './room.service';
import { SocketService } from './socket.service';

@Module({
  controllers: [],
  providers: [HomeAssistantService, EntityService, RoomService, SocketService],
  exports: [HomeAssistantService, EntityService, RoomService, SocketService],
})
export class HomeAssistantModule {}
