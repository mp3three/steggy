import { Controller, Get, Inject, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ACTIVE_APPLICATION,
  GenericVersionDTO,
  InjectConfig,
  WorkspaceService,
} from '@automagical/boilerplate';

import { HIDE_VERSION } from '../config';

@Controller()
@ApiTags('generic')
export class GenericController {
  constructor(
    @Inject(ACTIVE_APPLICATION)
    private readonly activeApplication: symbol,
    @InjectConfig(HIDE_VERSION) private readonly hideVersion: boolean,
    private readonly workspace: WorkspaceService,
  ) {}

  @Get(`/health`)
  public health(): unknown {
    return `OK`;
  }

  @Get(`/version`)
  @ApiOperation({
    description: `Retrieve some basic information about the server version`,
  })
  public version(): GenericVersionDTO & { application: string } {
    if (this.hideVersion) {
      // Nothing to see here
      throw new NotFoundException();
    }
    return {
      application: this.activeApplication.description,
      ...this.workspace.version(),
    };
  }
}
