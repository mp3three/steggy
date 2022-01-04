import { RoutineCaptureCommandDTO } from '@text-based/controller-logic';
import { PromptService } from '@text-based/tty';

import { RoutineCommand } from '../../../decorators';
import { GroupCommandService } from '../../groups';

@RoutineCommand({
  type: 'command',
})
export class RoutineCaptureService {
  constructor(
    private readonly groupCommand: GroupCommandService,
    private readonly promptService: PromptService,
  ) {}

  public async build(
    current: Partial<RoutineCaptureCommandDTO> = {},
  ): Promise<RoutineCaptureCommandDTO> {
    current.group ??= [];
    current.key = await this.promptService.string(
      'Cache key (blank = auto)',
      current.key,
    );
    const allGroups = await this.groupCommand.list();
    current.group = await this.promptService.listBuild({
      current: allGroups
        .filter((item) => current.group.includes(item._id))
        .map((i) => [i.friendlyName, i._id]),
      items: 'groups',
      source: allGroups
        .filter((item) => !current.group.includes(item._id))
        .map((i) => [i.friendlyName, i._id]),
    });

    return current as RoutineCaptureCommandDTO;
  }
}
