import { Controller, Get, Inject, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ACTIVE_APPLICATION,
  InjectConfig,
  WorkspaceService,
} from '@steggy/boilerplate';

import { HIDE_VERSION } from '../config';
import { VersionResponse } from '../contracts';

@Controller()
@ApiTags('generic')
export class GenericController {
  constructor(
    @Inject(ACTIVE_APPLICATION)
    private readonly activeApplication: symbol,
    @InjectConfig(HIDE_VERSION) private readonly hideVersion: boolean,
    private readonly workspace: WorkspaceService,
  ) {}

  private BOOT_TIME = Date.now();

  @Get(`/health`)
  public health(): unknown {
    return `OK`;
  }

  @Get(`/version`)
  @ApiOperation({
    description: `Retrieve some basic information about the server version`,
  })
  public version(): VersionResponse {
    if (this.hideVersion) {
      // Nothing to see here
      throw new NotFoundException();
    }
    return {
      application: this.activeApplication.description,
      boot: this.BOOT_TIME,
      ...this.workspace.version(),
    };
  }
}
