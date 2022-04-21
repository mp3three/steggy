import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
} from '@steggy/boilerplate';
import {
  GeneralSaveStateDTO,
  RoutineCaptureCommandDTO,
  RoutineCaptureData,
  RoutineDTO,
} from '@steggy/controller-shared';
import { each } from '@steggy/utilities';

import { GroupService } from '../group.service';

@Injectable()
export class CaptureCommandService {
  constructor(
    @Inject(forwardRef(() => GroupService))
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
    const states: Record<string, GeneralSaveStateDTO[]> = {};
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
