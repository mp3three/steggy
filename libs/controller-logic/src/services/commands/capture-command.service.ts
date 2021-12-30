import { Injectable } from '@nestjs/common';
import {
  domain,
  EntityManagerService,
  HASS_DOMAINS,
} from '@text-based/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  is,
} from '@text-based/utilities';
import { each } from 'async';

import {
  LightingCacheDTO,
  RoutineCaptureCommandDTO,
  RoutineCaptureData,
  RoutineCaptureEntity,
  RoutineDTO,
} from '../../contracts';
import { GroupService } from '../groups';
import { LightManagerService } from '../lighting';

@Injectable()
export class CaptureCommandService {
  constructor(
    private readonly entityService: EntityManagerService,
    private readonly groupService: GroupService,
    private readonly lightMangager: LightManagerService,
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
      .getEntities(is.unique(command.entity))
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
    const lights = command.entity.filter(
      (i) => domain(i) === HASS_DOMAINS.light,
    );
    const lightCache: Record<string, LightingCacheDTO> = {};
    await each(lights, async (id, callback) => {
      lightCache[id] = await this.lightMangager.getState(id);
      if (callback) {
        callback();
      }
    });
    await this.cache.set(command.key, {
      lightCache,
      states,
    } as RoutineCaptureData);
    this.logger.debug(`Captured cache state {${command.key}}`);
  }
}
