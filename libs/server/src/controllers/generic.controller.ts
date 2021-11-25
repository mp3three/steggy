import {
  ACTIVE_APPLICATION,
  InjectConfig,
  WorkspaceService,
} from '@ccontour/utilities';
import { Controller, Get, Inject, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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
    description: `Retrieve some basic information about `,
  })
  public version(): unknown {
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
