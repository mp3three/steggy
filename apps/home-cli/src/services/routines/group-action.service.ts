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
    current: RoutineCommandGroupActionDTO,
    groups: string[],
  ): Promise<RoutineCommandGroupActionDTO> {
    const group = await this.groupService.pickOne(groups);
    switch (group.type) {
      case GROUP_TYPES.light:
        return {
          ...(await this.lightGroup.commandBuilder(
            current?.command,
            current.extra,
          )),
          group: group._id,
        };
      case GROUP_TYPES.switch:
        throw new NotImplementedException();
    }
    throw new NotImplementedException();
  }
}
