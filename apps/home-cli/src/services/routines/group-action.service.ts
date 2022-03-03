import {
  GROUP_TYPES,
  RoutineCommandGroupActionDTO,
} from '@automagical/controller-shared';
import { Injectable, NotImplementedException } from '@nestjs/common';

import {
  GroupCommandService,
  LightGroupCommandService,
  SwitchGroupCommandService,
} from '../groups';

@Injectable()
export class GroupActionService {
  constructor(
    private readonly groupService: GroupCommandService,
    private readonly lightGroup: LightGroupCommandService,
    private readonly switchGroup: SwitchGroupCommandService,
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
            current?.extra,
          )),
          group: group._id,
        } as RoutineCommandGroupActionDTO;
      case GROUP_TYPES.switch:
        return {
          ...(await this.switchGroup.commandBuilder(current?.command)),
          group: group._id,
        } as RoutineCommandGroupActionDTO;
    }
    throw new NotImplementedException();
  }
}
