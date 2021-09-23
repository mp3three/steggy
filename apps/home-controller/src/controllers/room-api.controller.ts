import type { iRoomController } from '@automagical/controller-logic';
import {
  LightManagerService,
  RoomCommandDTO,
  RoomControllerSettingsDTO,
  RoomInstancePipe,
  RoomManagerService,
  RoomSettingsPipe,
} from '@automagical/controller-logic';
import { FanDomainService, FanSpeeds } from '@automagical/home-assistant';
import { EnumContainsPipe, GENERIC_RESPONSE } from '@automagical/server';
import { AutoLogService } from '@automagical/utilities';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
    private readonly fanDomain: FanDomainService,
  ) {}

  /**
   * Turn on all the lights fro the room
   */
  @Put('/:name/areaOn')
  public async areaOn(
    @Param('name', RoomSettingsPipe) settings: RoomControllerSettingsDTO,
    @Body(ValidationPipe) body: RoomCommandDTO,
  ): Promise<typeof GENERIC_RESPONSE> {
    await this.roomManager.areaOn(settings, body);
    this.logger.info({ body, name }, 'areaOn');
    return GENERIC_RESPONSE;
  }

  /**
   * Turn off all the lights for the room
   */
  @Put('/:name/areaOff')
  public async areaOff(
    @Param('name', RoomSettingsPipe) settings: RoomControllerSettingsDTO,
    @Param('name') name: string,
    @Body(ValidationPipe) body: RoomCommandDTO,
  ): Promise<typeof GENERIC_RESPONSE> {
    await this.roomManager.areaOff(settings, body);
    this.logger.info({ body, name }, 'areaOff');
    return GENERIC_RESPONSE;
  }

  /**
   * Activate the favorite command if available
   */
  @Put('/:name/favorite')
  public async favorite(
    @Param('name', RoomInstancePipe) instance: iRoomController,
    @Body(ValidationPipe) body: RoomCommandDTO,
  ): Promise<typeof GENERIC_RESPONSE> {
    if (!instance.favorite) {
      throw new BadRequestException(`Room does not support command`);
    }
    await instance.favorite(body);
    this.logger.info({ body, name }, 'favorite');
    return GENERIC_RESPONSE;
  }

  /**
   * Set the room's fan speed (if fan is available)
   */
  @Put('/:name/fan/:speed')
  public async setFan(
    @Param('name', RoomSettingsPipe) settings: RoomControllerSettingsDTO,
    @Param('speed', new EnumContainsPipe(FanSpeeds)) speed: FanSpeeds,
  ): Promise<typeof GENERIC_RESPONSE> {
    if (!settings.fan) {
      throw new BadRequestException(`Room does not have a registered fan`);
    }
    if (!Object.values(FanSpeeds).includes(speed)) {
      throw new BadRequestException(`Room does not have a registered fan`);
    }
    await this.fanDomain.setFan(settings.fan, speed);
    return GENERIC_RESPONSE;
  }

  /**
   * List the available metadata for all rooms
   */
  @Get('/list')
  public listRooms(): RoomControllerSettingsDTO[] {
    return [...this.roomManager.settings.values()];
  }

  /**
   * Give a more detailed view into a room
   */
  @Get('/:name/details')
  public async getDetails(
    @Param('name', RoomSettingsPipe) settings: RoomControllerSettingsDTO,
  ): Promise<typeof GENERIC_RESPONSE> {
    settings;
    return GENERIC_RESPONSE;
  }
}
