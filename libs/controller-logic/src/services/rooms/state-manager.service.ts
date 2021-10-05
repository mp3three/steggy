import {
  domain,
  HASS_DOMAINS,
  SwitchDomainService,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  InjectConfig,
  Trace,
} from '@automagical/utilities';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { each } from 'async';

import { CACHE_TTL } from '../../config';
import {
  DuplicateStateDTO,
  PersistenceLightStateDTO,
  RoomControllerSettingsDTO,
  RoomStateDTO,
} from '../../contracts';
import { LightManagerService } from '../light-manager.service';
import { StatePersistenceService } from '../persistence/state-persistence.service';

const CACHE_KEY = (room, flag) => `FLAGS:${room}/${flag}`;

/**
 * This service exists to manage room flags.
 * Future expansion as specific room functionality demands it's own state management
 */
@Injectable()
export class StateManagerService {
  constructor(
    private readonly lightManager: LightManagerService,
    private readonly switchService: SwitchDomainService,
    private readonly statePersistence: StatePersistenceService,
    @InjectCache() private readonly cacheService: CacheManagerService,
    private readonly logger: AutoLogService,
    @InjectConfig(CACHE_TTL) private readonly cacheTtl: number,
  ) {}

  @Trace()
  public async addFlag(
    {
      friendlyName,
      name,
    }: Pick<RoomControllerSettingsDTO, 'name' | 'friendlyName'>,
    flagName: string,
  ): Promise<void> {
    if (await this.hasFlag({ name }, flagName)) {
      return;
    }
    this.logger.debug(`[${friendlyName}] Add flag {${flagName}}`);
    const key = CACHE_KEY(name, flagName);
    await this.cacheService.set(key, true, {
      ttl: this.cacheTtl,
    });
  }

  @Trace()
  public async deleteState(id: string): Promise<void> {
    await this.statePersistence.delete(id);
  }

  @Trace()
  public async duplicateState(
    id: string,
    target: DuplicateStateDTO,
  ): Promise<RoomStateDTO> {
    const state = await this.statePersistence.findById(id, {});
    if (!state) {
      throw new NotFoundException(`State not found ${id}`);
    }
    if (state.entities.length !== target.entities.length) {
      throw new BadRequestException(`Group size mismatch`);
    }
    // Clean up auto generated attributes
    delete state.created;
    delete state.modified;
    delete state._id;
    // Update references to match the new group
    state.room = target.room;
    state.group = target.group;
    state.entities = target.entities;
    state.states.forEach((state, index) => {
      state.entity_id = target.entities[index];
    });
    return await this.statePersistence.create(state);
  }

  @Trace()
  public async hasFlag(
    { name }: Pick<RoomControllerSettingsDTO, 'name'>,
    flagName: string,
  ): Promise<boolean> {
    return await this.cacheService.wrap<boolean>(
      CACHE_KEY(name, flagName),
      () => false,
    );
  }

  @Trace()
  public async loadState(id: string): Promise<void> {
    const state = await this.statePersistence.findById(id, {});
    if (!state) {
      throw new NotFoundException(`State not found ${id}`);
    }
    await each(
      state.states,
      async (state: PersistenceLightStateDTO, callback) => {
        if (
          domain(state.entity_id) === HASS_DOMAINS.switch ||
          state.state === 'off'
        ) {
          await (state.state === 'on'
            ? this.switchService.turnOn(state.entity_id)
            : this.switchService.turnOff(state.entity_id));
          return callback();
        }
        await this.lightManager.turnOnEntities(state.entity_id, {
          brightness: state.brightness,
          hs_color: state.hs_color,
          kelvin: state.kelvin,
        });
        callback();
      },
    );
  }

  @Trace()
  public async removeFlag(
    {
      friendlyName,
      name,
    }: Pick<RoomControllerSettingsDTO, 'name' | 'friendlyName'>,
    flagName: string,
  ): Promise<void> {
    if (!(await this.hasFlag({ name }, flagName))) {
      return;
    }
    this.logger.debug(`[${friendlyName}] Remove flag {${flagName}}`);
    this.cacheService.del(CACHE_KEY(name, flagName));
  }
}
