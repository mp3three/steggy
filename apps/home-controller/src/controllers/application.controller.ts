import {
  iRoomControllerMethods,
  ROOM_COMMAND,
  RoomControllerSettingsDTO,
  RoomExplorerService,
} from '@automagical/controller-logic';
import { AutoLogService, OnceIsEnough } from '@automagical/utilities';
import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

@Controller()
export class ApplicationController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AutoLogService,
    private readonly roomExplorer: RoomExplorerService,
  ) {}

  /**
   * List all rooms by name
   */
  @Get('/room/list')
  @OnceIsEnough()
  public async listRooms(): Promise<RoomControllerSettingsDTO[]> {
    const rooms: RoomControllerSettingsDTO[] = [];
    this.roomExplorer.rooms.forEach((settings) => {
      rooms.push(settings);
    });
    return rooms;
  }

  @Put('/command/:room/:command')
  public async roomCommand(
    @Param('room') room: string,
    @Param('command') command: keyof iRoomControllerMethods,
    @Body() body: Record<string, unknown>,
  ): Promise<unknown> {
    this.logger.info({ body, command, room }, `http command`);
    this.eventEmitter.emit(ROOM_COMMAND(room, command), body);
    return [room, command, body];
  }
}
