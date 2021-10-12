import {
  LightingCacheDTO,
  LightManagerService,
} from '@automagical/controller-logic';
import { AuthStack } from '@automagical/server';
import { Controller, Get } from '@nestjs/common';

@Controller(`/debug`)
@AuthStack()
export class DebugController {
  constructor(private readonly lightManger: LightManagerService) {}

  @Get(`/active-lights`)
  public async activeLights(): Promise<Record<string, LightingCacheDTO>> {
    const lights = await this.lightManger.getActiveLights();
    const out: Record<string, LightingCacheDTO> = {};
    await Promise.all(
      lights.map(async (id) => (out[id] = await this.lightManger.getState(id))),
    );
    return out;
  }
}
