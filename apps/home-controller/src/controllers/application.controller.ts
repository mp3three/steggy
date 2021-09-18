import {
  iRoomControllerMethods,
  ROOM_COMMAND,
} from '@automagical/controller-logic';
import { AutoLogService } from '@automagical/utilities';
import { Controller, Get, Param } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

@Controller()
export class ApplicationController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AutoLogService,
  ) {}

  public async getRooms(): Promise<string[]> {
    return [];
  }

  @Get('/command/:room/:command')
  public async roomCommand(
    @Param('room') room: string,
    @Param('command') command: keyof iRoomControllerMethods,
  ): Promise<void> {
    this.logger.info({ command, room }, `http command`);
    this.eventEmitter.emit(ROOM_COMMAND(room, command));
  }
}
