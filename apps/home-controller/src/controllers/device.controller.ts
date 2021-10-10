import {
  DeviceListItemDTO,
  HASocketAPIService,
} from '@automagical/home-assistant';
import { AuthStack } from '@automagical/server';
import { Controller, Get } from '@nestjs/common';

@Controller(`/device`)
@AuthStack()
export class DeviceController {
  constructor(private readonly socketService: HASocketAPIService) {}

  @Get(`/list`)
  public async listDevices(): Promise<DeviceListItemDTO[]> {
    return await this.socketService.listDevices();
  }
}
