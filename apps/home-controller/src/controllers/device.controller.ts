import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeviceService, HASocketAPIService } from '@automagical/home-assistant';
import {
  DeviceListItemDTO,
  RelatedDescriptionDTO,
} from '@automagical/home-assistant-shared';
import { AuthStack } from '@automagical/server';

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
  @ApiOperation({
    description: `Find entities related to this device`,
  })
  public async findRelated(
    @Param('device') id: string,
  ): Promise<RelatedDescriptionDTO> {
    return await this.deviceService.findRelated(id);
  }

  @Get(`/list`)
  @ApiOperation({
    description: `List all devices`,
  })
  @ApiResponse({ type: [DeviceListItemDTO] })
  public async listDevices(): Promise<DeviceListItemDTO[]> {
    return await this.socketService.listDevices();
  }
}
