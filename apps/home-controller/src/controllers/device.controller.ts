import {
  DeviceListItemDTO,
  DeviceService,
  HASocketAPIService,
  RelatedDescriptionDTO,
} from '@ccontour/home-assistant';
import { AuthStack } from '@ccontour/server';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller(`/device`)
@ApiTags('device')
@AuthStack()
export class DeviceController {
  constructor(
    private readonly socketService: HASocketAPIService,
    private readonly deviceService: DeviceService,
  ) {}

  @Get(`/inspect/:device`)
  public async findRelated(
    @Param('device') id: string,
  ): Promise<RelatedDescriptionDTO> {
    return await this.deviceService.findRelated(id);
  }

  @Get(`/list`)
  public async listDevices(): Promise<DeviceListItemDTO[]> {
    return await this.socketService.listDevices();
  }
}
