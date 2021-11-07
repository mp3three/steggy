import {
  LightingCacheDTO,
  LightManagerService,
} from '@automagical/controller-logic';
import { HASocketAPIService, HassConfig } from '@automagical/home-assistant';
import { AuthStack } from '@automagical/server';
import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller(`/debug`)
@AuthStack()
export class DebugController {
  constructor(
    private readonly lightManger: LightManagerService,
    private readonly socketService: HASocketAPIService,
  ) {}

  @Get(`/active-lights`)
  public async activeLights(): Promise<Record<string, LightingCacheDTO>> {
    const lights = await this.lightManger.getActiveLights();
    const out: Record<string, LightingCacheDTO> = {};
    await Promise.all(
      lights.map(async (id) => (out[id] = await this.lightManger.getState(id))),
    );
    return out;
  }

  @Get(`/hass-config`)
  public async hassConfig(): Promise<HassConfig> {
    return await this.socketService.getConfig();
  }

  @Post(`/render-template`)
  public async renderTemplate(
    @Body() { template }: { template: string },
  ): Promise<string> {
    return await this.socketService.renderTemplate(template);
  }
}
