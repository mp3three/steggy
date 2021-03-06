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
  ChronoService,
  DataAggregatorService,
  DebuggerService,
  RecorderService,
  RoutineEnabledService,
  RoutineService,
  SolarCalcService,
  TypeGeneratorService,
} from '@steggy/controller-sdk';
import {
  ActivationEventSettings,
  DebugReportDTO,
  RoutineCommandSettings,
  RoutineTriggerEvent,
  tNestedObject,
} from '@steggy/controller-shared';
import {
  HACallService,
  HASocketAPIService,
  HomeAssistantFetchAPIService,
  NotifyDomainService,
} from '@steggy/home-assistant';
import {
  HassConfig,
  HassNotificationDTO,
  ServiceListItemDTO,
} from '@steggy/home-assistant-shared';
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
    private readonly call: HACallService,
    private readonly chrono: ChronoService,
    private readonly dataAggregator: DataAggregatorService,
    private readonly debug: DebuggerService,
    private readonly haFetch: HomeAssistantFetchAPIService,
    private readonly nodeRed: NodeRedCommand,
    private readonly notification: NotifyDomainService,
    private readonly recorder: RecorderService,
    private readonly routineEnabled: RoutineEnabledService,
    private readonly routine: RoutineService,
    private readonly socket: HASocketAPIService,
    private readonly solarCalc: SolarCalcService,
    private readonly typeGenerator: TypeGeneratorService,
  ) {}

  @Get('/editor-types')
  public async buildEditorTypes(): Promise<{ types: string }> {
    return { types: await this.typeGenerator.assemble() };
  }

  @Post(`/chrono-parse`)
  public chronoParse(
    @Body() { expression }: { expression: string[] },
  ): string[][] {
    return expression.map(line =>
      this.chrono.parse(line).map((date: Date) => date.toISOString()),
    );
  }

  @Delete(`/notification/:id`)
  @ApiGenericResponse()
  @ApiOperation({
    description: `Dismiss a persistent notification from home assistant`,
  })
  public async dismissNotifications(
    @Param('id') id: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.call.dismissNotification(id);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Get(`/enabled-routines`)
  public enabled(): string[] {
    return [...this.routineEnabled.ACTIVE_ROUTINES.values()];
  }

  @Get('/find-broken')
  @ApiResponse({ type: [DebugReportDTO] })
  public async findBroken(): Promise<DebugReportDTO> {
    return await this.debug.sanityCheck();
  }

  @Get('/data-all')
  @ApiOperation({
    description: `Retrieve data properties that would be passed into vmservice`,
  })
  public async getAggregateData(): Promise<tNestedObject> {
    return await this.dataAggregator.load();
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

  @Get('/data-math')
  @ApiOperation({
    description: `Retrieve data properties that would be passed into the math interpreter`,
  })
  public async getMathData(): Promise<tNestedObject> {
    return await this.dataAggregator.load('number');
  }

  @Get('/notifications')
  @ApiResponse({ type: [HassNotificationDTO] })
  @ApiOperation({
    description: `Retrieve home assistant persistent notifications`,
  })
  @UseInterceptors(JSONFilterInterceptor)
  public async getNotifications(): Promise<HassNotificationDTO[]> {
    return await this.socket.getNotifications();
  }

  @Get(`/hass-config`)
  @ApiResponse({ type: HassConfig })
  @ApiOperation({
    description: `Retrieve home assistant config`,
  })
  public async hassConfig(): Promise<HassConfig> {
    return await this.socket.getConfig();
  }

  @Get(`/activation-event`)
  @ApiResponse({ type: [ActivationEventSettings] })
  @UseInterceptors(JSONFilterInterceptor)
  public listActivationEvents(): ActivationEventSettings[] {
    return [...this.routine.ACTIVATION_EVENTS.values()];
  }

  @Get(`/routine-command`)
  @ApiResponse({ type: [RoutineCommandSettings] })
  @UseInterceptors(JSONFilterInterceptor)
  public listRoutineCommands(): RoutineCommandSettings[] {
    return [...this.routine.ROUTINE_COMMAND.values()];
  }

  @Get('/home-assistant/services')
  @ApiResponse({ type: [ServiceListItemDTO] })
  public async listServices(): Promise<ServiceListItemDTO[]> {
    return await this.haFetch.listServices();
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
    return await this.recorder.recentRoutines();
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
    return await this.socket.renderTemplate(template);
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
    template = await this.socket.renderTemplate(template);
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
