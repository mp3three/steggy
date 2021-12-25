import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  DeviceListItemDTO,
  DeviceService,
  HASocketAPIService,
  RelatedDescriptionDTO,
} from '@text-based/home-assistant';
import { AuthStack } from '@text-based/server';

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
