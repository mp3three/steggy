import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ActivationEventSettings,
  DebuggerService,
  RecorderService,
  RoutineCommandSettings,
  RoutineEnabledService,
  RoutineService,
  SolarCalcService,
} from '@steggy/controller-sdk';
import { DebugReportDTO, RoutineTriggerEvent } from '@steggy/controller-shared';
import {
  HACallService,
  HASocketAPIService,
  NotifyDomainService,
} from '@steggy/home-assistant';
import { HassConfig, HassNotificationDTO } from '@steggy/home-assistant-shared';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  JSONFilterInterceptor,
} from '@steggy/server';

import { NodeRedCommand } from '../services';

@Controller(`/debug`)
@ApiTags('debug')
@AuthStack()
export class DebugController {
  constructor(
    private readonly callService: HACallService,
    private readonly debugService: DebuggerService,
    private readonly nodeRed: NodeRedCommand,
    private readonly notification: NotifyDomainService,
    private readonly recorderService: RecorderService,
    private readonly routineEnabled: RoutineEnabledService,
    private readonly routineService: RoutineService,
    private readonly socketService: HASocketAPIService,
    private readonly solarCalc: SolarCalcService,
  ) {}

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

  @Get(`/enabled-routines`)
  public enabled(): string[] {
    return [...this.routineEnabled.ACTIVE_ROUTINES.values()];
  }

  @Get('/find-broken')
  @ApiResponse({ type: [DebugReportDTO] })
  public async findBroken(): Promise<DebugReportDTO> {
    return await this.debugService.sanityCheck();
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
  @UseInterceptors(JSONFilterInterceptor)
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

  @Get(`/activation-event`)
  @ApiResponse({ type: [ActivationEventSettings] })
  @UseInterceptors(JSONFilterInterceptor)
  public listActivationEvents(): ActivationEventSettings[] {
    return [...this.routineService.ACTIVATION_EVENTS.values()];
  }

  @Get(`/routine-command`)
  @ApiResponse({ type: [RoutineCommandSettings] })
  @UseInterceptors(JSONFilterInterceptor)
  public listRoutineCommands(): RoutineCommandSettings[] {
    return [...this.routineService.ROUTINE_COMMAND.values()];
  }

  @Get(`/node-red/commands`)
  @UseInterceptors(JSONFilterInterceptor)
  public async nodeRedCommands(): Promise<Record<'id' | 'name', string>[]> {
    return await this.nodeRed.listAvailable();
  }

  @Get('/recent-activations')
  @ApiResponse({ type: [RoutineTriggerEvent] })
  @UseInterceptors(JSONFilterInterceptor)
  public async recentActivations(): Promise<RoutineTriggerEvent[]> {
    return await this.recorderService.recentRoutines();
  }

  @Post('/reload')
  @ApiOperation({
    description: `Stop all routine listeners, reload caches from database, then start again.`,
  })
  public async reload(): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.routineEnabled.reload();
    return GENERIC_SUCCESS_RESPONSE;
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

  @Get('/solar')
  public async solar(): Promise<unknown> {
    const calc = await this.solarCalc.getCalc();
    return {
      astronomicalDawn: calc.astronomicalDawn.toLocaleString(),
      astronomicalDusk: calc.astronomicalDusk.toLocaleString(),
      civilDawn: calc.civilDawn.toLocaleString(),
      civilDusk: calc.civilDusk.toLocaleString(),
      dawn: calc.dawn.toLocaleString(),
      dusk: calc.dusk.toLocaleString(),
      nauticalDawn: calc.nauticalDawn.toLocaleString(),
      nauticalDusk: calc.nauticalDusk.toLocaleString(),
      nightEnd: calc.nightEnd.toLocaleString(),
      nightStart: calc.nightStart.toLocaleString(),
      solarNoon: calc.solarNoon.toLocaleString(),
      sunrise: calc.sunrise.toLocaleString(),
      sunriseEnd: calc.sunriseEnd.toLocaleString(),
      sunset: calc.sunset.toLocaleString(),
      sunsetStart: calc.sunsetStart.toLocaleString(),
    };
  }
}
