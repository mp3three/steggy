import {
  LIGHTING_CACHE_SCHEMA,
  LightingCacheDTO,
  LightManagerService,
  SolarCalcService,
} from '@for-science/controller-logic';
import {
  HACallService,
  HASocketAPIService,
  HassConfig,
  HassNotificationDTO,
  NotifyDomainService,
} from '@for-science/home-assistant';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
} from '@for-science/server';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
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
    private readonly callService: HACallService,
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

  @Delete(`/notification/:id`)
  @ApiGenericResponse()
  @ApiOperation({
    description: `Dismiss a persistent notification from home assistant`,
  })
  public async dismissNotifications(
    @Param('id') id: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.callService.dismissNotification(id);
    return GENERIC_SUCCESS_RESPONSE;
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

  @Get('/notifications')
  @ApiResponse({ type: [HassNotificationDTO] })
  @ApiOperation({
    description: `Retrieve home assistant persistent notifications`,
  })
  public async getNotifications(): Promise<HassNotificationDTO[]> {
    return await this.socketService.getNotifications();
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
