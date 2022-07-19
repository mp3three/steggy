import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeviceService, HASocketAPIService } from '@steggy/home-assistant';
import {
  DeviceListItemDTO,
  RelatedDescriptionDTO,
} from '@steggy/home-assistant-shared';
import { AuthStack } from '@steggy/server';

@Controller(`/device`)
@ApiTags('device')
@AuthStack()
export class DeviceController {
  constructor(
    private readonly socket: HASocketAPIService,
    private readonly device: DeviceService,
  ) {}

  @Get(`/inspect/:device`)
  @ApiResponse({ type: RelatedDescriptionDTO })
  @ApiOperation({
    description: `Find entities related to this device`,
  })
  public async findRelated(
    @Param('device') id: string,
  ): Promise<RelatedDescriptionDTO> {
    return await this.device.findRelated(id);
  }

  @Get(`/list`)
  @ApiOperation({
    description: `List all devices`,
  })
  @ApiResponse({ type: [DeviceListItemDTO] })
  public async listDevices(): Promise<DeviceListItemDTO[]> {
    return await this.socket.listDevices();
  }
}
