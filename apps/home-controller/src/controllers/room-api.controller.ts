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
  ValidationPipe,
} from '@nestjs/common';

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
    @Body(ValidationPipe) body: RoomCommandDTO,
  ): Promise<typeof GENERIC_RESPONSE> {
    const settings = this.getRoom(name);
    await this.roomManager.areaOn(settings, body);
    return GENERIC_RESPONSE;
  }

  @Put('/:name/areaOff')
  public async areaOff(
    @Param('name') name: string,
    @Body(ValidationPipe) body: RoomCommandDTO,
  ): Promise<typeof GENERIC_RESPONSE> {
    const settings = this.getRoom(name);
    await this.roomManager.areaOff(settings, body);
    return GENERIC_RESPONSE;
  }

  @Put('/:name/favorite')
  public async favorite(
    @Param('name') name: string,
    @Body(ValidationPipe) body: RoomCommandDTO,
  ): Promise<typeof GENERIC_RESPONSE> {
    const instance = this.getInstance(name);
    if (!instance.favorite) {
      throw new BadRequestException(`Room does not support command`);
    }
    await instance.favorite(body);
    return GENERIC_RESPONSE;
  }

  @Get('/list')
  public listRooms(): RoomControllerSettingsDTO[] {
    // @ts-expect-error Serializing
    return [...this.roomManager.settings.values()].map((room) => {
      return {
        ...room,
        flags: room.flags.values(),
      };
    });
  }

  private getRoom(name: string): RoomControllerSettingsDTO {
    const settings = this.roomManager.settings.get(name);
    if (!settings) {
      throw new NotFoundException(`Room not found: ${name}`);
    }
    return settings;
  }

  private getInstance(name: string): iRoomController {
    const instance = this.roomManager.controllers.get(name);
    if (!instance) {
      throw new NotFoundException(`Room not found: ${name}`);
    }
    return instance;
  }
}
