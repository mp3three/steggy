import {
  DeviceListItemDTO,
  DeviceService,
  HASocketAPIService,
  RelatedDescriptionDTO,
} from '@ccontour/home-assistant';
import { AuthStack } from '@ccontour/server';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller(`/device`)
@ApiTags('device')
@AuthStack()
export class DeviceController {
  constructor(
    private readonly socketService: HASocketAPIService,
    private readonly deviceService: DeviceService,
  ) {}

  @Get(`/inspect/:device`)
  @ApiResponse({ type: RelatedDescriptionDTO })
  public async findRelated(
    @Param('device') id: string,
  ): Promise<RelatedDescriptionDTO> {
    return await this.deviceService.findRelated(id);
  }

  @Get(`/list`)
  @ApiResponse({ type: [DeviceListItemDTO] })
  public async listDevices(): Promise<DeviceListItemDTO[]> {
    return await this.socketService.listDevices();
  }
}
