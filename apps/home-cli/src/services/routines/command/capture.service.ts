import { Injectable } from '@nestjs/common';
import { RoutineCaptureCommandDTO } from '@text-based/controller-logic';
import { PromptService } from '@text-based/tty';
import { is } from '@text-based/utilities';

import { GroupCommandService } from '../../groups';
import { EntityService } from '../../home-assistant';

@Injectable()
export class RoutineCaptureService {
  constructor(
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly groupCommand: GroupCommandService,
  ) {}

  public async build(
    current: Partial<RoutineCaptureCommandDTO> = {},
  ): Promise<RoutineCaptureCommandDTO> {
    current.group ??= [];
    current.entity ??= [];
    if (
      !is.empty(current.key) ||
      (await this.promptService.confirm('Custom cache key?'))
    ) {
      current.key = await this.promptService.string('Cache key', current.key);
    }
    const allGroups = await this.groupCommand.list();
    if (
      !is.empty(allGroups) &&
      (!is.empty(current.group) ||
        (await this.promptService.confirm(`Add groups to capture?`)))
    ) {
      current.group = await this.promptService.listBuild({
        current: allGroups
          .filter((item) => current.group.includes(item._id))
          .map((i) => [i.friendlyName, i._id]),
        items: 'groups',
        source: allGroups
          .filter((item) => !current.group.includes(item._id))
          .map((i) => [i.friendlyName, i._id]),
      });
    }
    const allEntities = await this.entityService.list();
    if (!is.empty(current.entity) || (await this.promptService.acknowledge())) {
      current.entity = await this.promptService.listBuild({
        current: allEntities
          .filter((i) => current.entity.includes(i))
          .map((i) => [i, i]),
        source: allEntities
          .filter((i) => !current.entity.includes(i))
          .map((i) => [i, i]),
      });
      current.captureState = await this.promptService.boolean(
        'Capture entity states?',
        current.captureState,
      );
    }
    return current as RoutineCaptureCommandDTO;
  }
}
