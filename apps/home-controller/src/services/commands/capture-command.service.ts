import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
} from '@automagical/boilerplate';
import {
  RoomEntitySaveStateDTO,
  RoutineCaptureCommandDTO,
  RoutineCaptureData,
  RoutineDTO,
} from '@automagical/controller-shared';
import { each } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { GroupService } from '../groups';

@Injectable()
export class CaptureCommandService {
  constructor(
    private readonly groupService: GroupService,
    private readonly logger: AutoLogService,
    @InjectCache() private readonly cache: CacheManagerService,
  ) {}

  public async activate(
    command: RoutineCaptureCommandDTO,
    routine: RoutineDTO,
  ): Promise<void> {
    command.key ??= routine._id;
    command.group ??= [];
    const states: Record<string, RoomEntitySaveStateDTO[]> = {};
    await each(command.group, async id => {
      const group = await this.groupService.get(id);
      const type = this.groupService.getBaseGroup(group.type);
      states[id] = await type.getState(group);
    });
    await this.cache.set(command.key, {
      states,
    } as RoutineCaptureData);
    this.logger.debug(`Captured cache state {${command.key}}`);
  }
}