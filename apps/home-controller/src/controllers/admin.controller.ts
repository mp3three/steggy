import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AutoLogService } from '@steggy/boilerplate';
import {
  HACallService,
  HomeAssistantFetchAPIService,
} from '@steggy/home-assistant';
import {
  HASS_DOMAINS,
  HomeAssistantServerLogItem,
} from '@steggy/home-assistant-shared';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
} from '@steggy/server';

@Controller('/admin')
@AuthStack()
@ApiTags('admin')
export class AdminController {
  constructor(
    private readonly fetchService: HomeAssistantFetchAPIService,
    private readonly callService: HACallService,
    private readonly logger: AutoLogService,
  ) {}

  @Post('/server/check')
  @ApiGenericResponse()
  @ApiOperation({
    description: `Send a restart command to home assistant`,
  })
  public async checkConfig(): Promise<unknown> {
    return await this.fetchService.checkConfig();
  }

  @Delete('/server/logs')
  @ApiGenericResponse()
  @ApiOperation({
    description: `Clear recent logs`,
  })
  public async clearLogs(): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.callService.call('clear', {}, HASS_DOMAINS.system_log);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Get('/server/logs')
  @ApiOperation({
    description: `Home assistant logs`,
  })
  public async getLogs(): Promise<HomeAssistantServerLogItem[]> {
    const out = await this.fetchService.getLogs();
    return out;
  }

  @Post('/server/restart')
  @ApiGenericResponse()
  @ApiOperation({
    description: `Send a restart command to home assistant`,
  })
  public async hassReboot(): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    this.logger.warn(`Rebooting Home Assistant`);
    await this.callService.call(`restart`, {}, HASS_DOMAINS.homeassistant);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post('/server/stop')
  @ApiGenericResponse()
  @ApiOperation({
    description: `Send a stop command to home assistant`,
  })
  public async hassStop(): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    this.logger.warn(`Stopping Home Assistant`);
    await this.callService.call(`stop`, {}, HASS_DOMAINS.homeassistant);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Get('/server/raw-logs')
  @ApiOperation({
    description: `Raw home assistant logs`,
  })
  public async rawLogs(): Promise<string> {
    return await this.fetchService.getRawLogs();
  }

  @Post('/reload/:domain')
  @ApiGenericResponse()
  @ApiParam({
    enum: [
      'location',
      'automation',
      'input_boolean',
      'input_datetime',
      'input_number',
      'input_select',
      'input_text',
      'mqtt',
      'person',
      'scene',
      'script',
      'timer',
      'zone',
    ],
    name: 'domain',
  })
  @ApiOperation({
    description: `Send a domain reload command to home assistant`,
  })
  public async reloadDomain(
    @Param('domain') domain: HASS_DOMAINS,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    this.logger.warn(`Reloading domain {${domain}}`);
    await this.callService.call(`reload`, {}, domain);
    return GENERIC_SUCCESS_RESPONSE;
  }
}
