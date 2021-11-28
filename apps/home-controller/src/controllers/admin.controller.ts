import { HACallService, HASS_DOMAINS } from '@ccontour/home-assistant';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
} from '@ccontour/server';
import { AutoLogService } from '@ccontour/utilities';
import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/admin')
@AuthStack()
@ApiTags('admin')
export class AdminController {
  constructor(
    private readonly callService: HACallService,
    private readonly logger: AutoLogService,
  ) {}

  @Post('/hass-reboot')
  @ApiGenericResponse()
  @ApiOperation({
    description: `Send a restart command to home assistant`,
  })
  public async hassReboot(): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    this.logger.warn(`Rebooting Home Assistant`);
    const out = await this.callService.call(
      `restart`,
      {},
      HASS_DOMAINS.homeassistant,
    );
    this.logger.debug({ out });
    return GENERIC_SUCCESS_RESPONSE;
  }
}
