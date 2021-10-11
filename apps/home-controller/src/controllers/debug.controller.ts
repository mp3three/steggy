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
  public async activeLights(): Promise<LightingCacheDTO[]> {
    const lights = await this.lightManger.getActiveLights();
    return await Promise.all(
      lights.map(async (id) => await this.lightManger.getState(id)),
    );
  }
}
