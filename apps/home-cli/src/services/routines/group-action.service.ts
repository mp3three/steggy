import {
  GROUP_TYPES,
  RoutineCommandGroupActionDTO,
} from '@automagical/controller-logic';
import { PromptService } from '@automagical/tty';
import { Injectable, NotImplementedException } from '@nestjs/common';

import { GroupCommandService, LightGroupCommandService } from '../groups';

@Injectable()
export class GroupActionService {
  constructor(
    private readonly promptService: PromptService,
    private readonly groupService: GroupCommandService,
    private readonly lightGroup: LightGroupCommandService,
  ) {}

  public async build(
    current?: RoutineCommandGroupActionDTO,
  ): Promise<RoutineCommandGroupActionDTO> {
    const group = await this.groupService.pickOne();
    switch (group.type) {
      case GROUP_TYPES.light:
        return {
          ...(await this.lightGroup.commandBuilder(current.command)),
          group,
        };
    }
    throw new NotImplementedException();
  }
}
