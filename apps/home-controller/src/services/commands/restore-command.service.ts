import { Injectable } from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
} from '@steggy/boilerplate';
import {
  RoutineCaptureData,
  RoutineDTO,
  RoutineRestoreCommandDTO,
} from '@steggy/controller-shared';
import { each } from '@steggy/utilities';

import { GroupService } from '../group.service';

@Injectable()
export class RestoreCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly groupService: GroupService,
    @InjectCache() private readonly cache: CacheManagerService,
  ) {}

  public async activate(
    command: RoutineRestoreCommandDTO,
    routine: RoutineDTO,
  ): Promise<void> {
    command.key ??= routine._id;
    const cache = await this.cache.get<RoutineCaptureData>(command.key);
    if (!cache) {
      this.logger.error(`Missing cache {${command.key}}`);
      return;
    }
    await each(Object.entries(cache.states), async ([id, item]) => {
      const group = await this.groupService.get(id);
      const type = this.groupService.getBaseGroup(group.type);
      await type.setState(group.entities, item);
    });
    this.logger.debug(`Restored cache state ${command.key}`);
  }
}
