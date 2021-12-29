import { Injectable } from '@nestjs/common';
import { EntityManagerService } from '@text-based/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
} from '@text-based/utilities';
import { each } from 'async';

import {
  RoutineCaptureCommandDTO,
  RoutineCaptureData,
  RoutineCaptureEntity,
  RoutineDTO,
} from '../../contracts';
import { GroupService } from '../groups';

@Injectable()
export class CaptureCommandService {
  constructor(
    private readonly entityService: EntityManagerService,
    private readonly groupService: GroupService,
    private readonly logger: AutoLogService,
    @InjectCache() private readonly cache: CacheManagerService,
  ) {}

  public async activate(
    command: RoutineCaptureCommandDTO,
    routine: RoutineDTO,
  ): Promise<void> {
    command.key ??= routine._id;
    command.captureAttributes ??= [];
    command.entity ??= [];
    command.group ??= [];
    await each(command.group, async (id, callback) => {
      const group = await this.groupService.get(id);
      command.entity.push(...group.entities);
      if (callback) {
        callback();
      }
    });
    const states = this.entityService
      .getEntities(
        command.entity.filter(
          (item, index, array) => array.indexOf(item) === index,
        ),
      )
      .map(({ entity_id, state, attributes }) => {
        const out = { entity_id } as RoutineCaptureEntity;
        if (command.captureState) {
          out.state = state;
        }
        out.attributes = Object.fromEntries(
          command.captureAttributes.map((key) => [key, attributes[key]]),
        );
        return out;
      });
    const data = { states } as RoutineCaptureData;
    await this.cache.set(command.key, data);
    this.logger.debug(`Captured temp state {${command.key}}`);
  }
}
