import {
  LIGHTING_CACHE_SCHEMA,
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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller(`/debug`)
@ApiTags('debug')
@AuthStack()
export class DebugController {
  constructor(
    private readonly lightManger: LightManagerService,
    private readonly notification: NotifyDomainService,
    private readonly socketService: HASocketAPIService,
    private readonly solarCalc: SolarCalcService,
  ) {}

  @Get(`/active-lights`)
  @ApiResponse({
    schema: {
      additionalProperties: {
        properties: LIGHTING_CACHE_SCHEMA,
      },
    },
  })
  @ApiOperation({
    description: `Retrieve current state cache for all lights with a state of 'on'`,
  })
  public async activeLights(): Promise<Record<string, LightingCacheDTO>> {
    const lights = await this.lightManger.getActiveLights();
    const out: Record<string, LightingCacheDTO> = {};
    await Promise.all(
      lights.map(async (id) => (out[id] = await this.lightManger.getState(id))),
    );
    return out;
  }

  @Get('/location')
  @ApiResponse({
    schema: {
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
      },
      type: 'object',
    },
  })
  @ApiOperation({
    description: `Retrieve lat/long as defined in home assistant`,
  })
  public getLocation(): Record<'latitude' | 'longitude', number> {
    return {
      latitude: this.solarCalc.latitude,
      longitude: this.solarCalc.longitude,
    };
  }

  @Get(`/hass-config`)
  @ApiResponse({ type: HassConfig })
  @ApiOperation({
    description: `Retrieve home assistant config`,
  })
  public async hassConfig(): Promise<HassConfig> {
    return await this.socketService.getConfig();
  }

  @Post(`/render-template`)
  @ApiResponse({ schema: { type: 'string' } })
  @ApiBody({
    schema: {
      properties: { template: { type: 'string' } },
      type: 'object',
    },
  })
  @ApiOperation({
    description: `Take in a template string, and return back the rendered version`,
  })
  public async renderTemplate(
    @Body() { template }: { template: string },
  ): Promise<string> {
    return await this.socketService.renderTemplate(template);
  }

  @Post(`/send-notification`)
  @ApiResponse({ schema: { type: 'string' } })
  @ApiBody({
    schema: {
      properties: { template: { type: 'string' } },
      type: 'object',
    },
  })
  @ApiOperation({
    description: `Take in a template string, render it, then send it as a home assistant notification`,
  })
  public async sendNotification(
    @Body() { template }: { template: string },
  ): Promise<string> {
    template = await this.socketService.renderTemplate(template);
    await this.notification.notify(template);
    return template;
  }
}
