import {
  LightingCacheDTO,
  LightManagerService,
  SolarCalcService,
} from '@ccontour/controller-logic';
import {
  HASocketAPIService,
  HassConfig,
  NotifyDomainService,
} from '@ccontour/home-assistant';
import { AuthStack } from '@ccontour/server';
import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller(`/debug`)
@AuthStack()
export class DebugController {
  constructor(
    private readonly lightManger: LightManagerService,
    private readonly notification: NotifyDomainService,
    private readonly socketService: HASocketAPIService,
    private readonly solarCalc: SolarCalcService,
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

  @Get('/location')
  public getLocation(): Record<'latitude' | 'longitude', number> {
    return {
      latitude: this.solarCalc.latitude,
      longitude: this.solarCalc.longitude,
    };
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

  @Post(`/send-notification`)
  public async sendNotification(
    @Body() { template }: { template: string },
  ): Promise<string> {
    template = await this.socketService.renderTemplate(template);
    await this.notification.notify(template);
    return template;
  }
}
