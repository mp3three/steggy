import { Injectable } from '@nestjs/common';
import { RoutineCaptureCommandDTO } from '@text-based/controller-logic';
import { PromptService } from '@text-based/tty';
import { is } from '@text-based/utilities';

import { GroupCommandService } from '../../groups';
import { EntityService } from '../../home-assistant';
import { HomeFetchService } from '../../home-fetch.service';

@Injectable()
export class RoutineCaptureService {
  constructor(
    private readonly entityService: EntityService,
    private readonly fetchService: HomeFetchService,
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
