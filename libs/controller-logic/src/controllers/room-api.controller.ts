import { AutoLogService } from '@automagical/utilities';
import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Put,
} from '@nestjs/common';

import { iRoomController, RoomCommandDTO } from '../contracts';
import { LightManagerService } from '../services/light-manager.service';

const VALID_COMMANDS = new Set<keyof iRoomController>([
  'areaOn',
  'areaOff',
  'favorite',
  'dimUp',
  'dimDown',
]);
type PartialController = Pick<
  iRoomController,
  'areaOn' | 'areaOff' | 'favorite' | 'dimUp' | 'dimDown'
>;
@Controller(`/exec`)
export class RoomAPIController {
  constructor(
    private readonly lightManager: LightManagerService,
    private readonly logger: AutoLogService,
  ) {}

  @Put('/:name/:command')
  public async test(
    @Param('name') name: string,
    @Param('command') command: keyof PartialController,
    @Body() body: RoomCommandDTO,
  ): Promise<unknown> {
    if (!VALID_COMMANDS.has(command)) {
      this.logger.error({ body, command, name }, `Invalid command`);
      throw new BadRequestException(`Invalid command: ${command}`);
    }
    this.logger.info(`[${name}] HTTP Command {${command}}`);
    // const room = this.getRoom(name);
    // const result = await room[command](body);
    // return { command, name, result };
    return 'yay';
  }

  private getRoom(room: string): iRoomController {
    return;
  }
}
