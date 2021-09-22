import {
  iRoomController,
  LightManagerService,
  RoomCommandDTO,
  RoomControllerSettingsDTO,
  RoomManagerService,
} from '@automagical/controller-logic';
import { GENERIC_RESPONSE } from '@automagical/server';
import { AutoLogService } from '@automagical/utilities';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';

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
@Controller(`/room`)
export class RoomAPIController {
  constructor(
    private readonly lightManager: LightManagerService,
    private readonly logger: AutoLogService,
    private readonly roomManager: RoomManagerService,
  ) {}

  @Put('/:name/areaOn')
  public async areaOn(
    @Param('name') name: string,
    @Body() body: RoomCommandDTO,
  ): Promise<typeof GENERIC_RESPONSE> {
    // this.logger.info(`[${name}] HTTP Command {${command}}`);
    const settings = this.getRoom(name);
    await this.roomManager.areaOn(settings, body);
    return GENERIC_RESPONSE;
  }

  @Put('/:name/areaOff')
  public async areaOff(
    @Param('name') name: string,
    @Body() body: RoomCommandDTO,
  ): Promise<typeof GENERIC_RESPONSE> {
    // this.logger.info(`[${name}] HTTP Command {${command}}`);
    const settings = this.getRoom(name);
    await this.roomManager.areaOff(settings, body);
    return GENERIC_RESPONSE;
  }

  @Get('/list')
  public listRooms(): RoomControllerSettingsDTO[] {
    return [...this.roomManager.settings.values()];
  }

  private getRoom(name: string): RoomControllerSettingsDTO {
    const settings = this.roomManager.settings.get(name);
    if (!settings) {
      throw new NotFoundException(`Room not found: ${name}`);
    }
    return settings;
  }
}
