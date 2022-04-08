import { DeviceService, HASocketAPIService } from '@steggy/home-assistant';
import {
  DeviceListItemDTO,
  RelatedDescriptionDTO,
} from '@steggy/home-assistant-shared';
import { AuthStack } from '@steggy/server';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
