import {
  HACallService,
  HASS_DOMAINS,
  HomeAssistantFetchAPIService,
  HomeAssistantServerLogItem,
} from '@ccontour/home-assistant';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
} from '@ccontour/server';
import { AutoLogService } from '@ccontour/utilities';
import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

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

  @Get('/server/logs')
  @ApiGenericResponse()
  @ApiOperation({
    description: `Send a restart command to home assistant`,
  })
  public async getLogs(): Promise<HomeAssistantServerLogItem[]> {
    return await this.fetchService.getLogs();
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
