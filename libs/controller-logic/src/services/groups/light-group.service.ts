import {
  domain,
  EntityManagerService,
  HASS_DOMAINS,
  LightStateDTO,
} from '@automagical/home-assistant';
import { AutoLogService, InjectConfig, Trace } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { each, eachLimit } from 'async';

import { CONCURRENT_CHANGES, DIM_PERCENT } from '../../config';
import {
  GROUP_LIGHT_COMMANDS,
  GROUP_TYPES,
  GroupCommandDTO,
  GroupDTO,
  GroupLightCommandExtra,
  LIGHTING_MODE,
  LightingCacheDTO,
  RoomEntitySaveStateDTO,
} from '../../contracts';
import { LightManagerService } from '../light-manager.service';
import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';

type GroupParameter = GroupDTO<LightingCacheDTO> | string;
const START = 0;

/**
 * Light groups are intended to work with just light domain devices
 */
@Injectable()
export class LightGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    protected readonly groupPersistence: GroupPersistenceService,
    private readonly entityManager: EntityManagerService,
    @InjectConfig(DIM_PERCENT)
    private readonly dimAmount: number,
    private readonly lightManager: LightManagerService,
    @InjectConfig(CONCURRENT_CHANGES)
    private readonly eachLimit: number,
  ) {
    super();
  }

  public readonly GROUP_TYPE = GROUP_TYPES.light;

  @Trace()
  public async activateCommand(
    group: GroupParameter,
    command: GroupCommandDTO<GroupLightCommandExtra, GROUP_LIGHT_COMMANDS>,
  ): Promise<void> {
    switch (command.command) {
      case 'turnOff':
        return await this.turnOff(group);
      case 'turnOn':
        return await this.turnOn(group, false, command.extra?.brightness);
      case 'circadianOn':
        return await this.turnOn(group, true, command.extra?.brightness);
      case 'dimDown':
        return await this.dimDown(group, command.extra?.brightness);
      case 'dimUp':
        return await this.dimUp(group, command.extra?.brightness);
      default:
        throw new NotImplementedException();
    }
  }

  @Trace()
  public async dimDown(group: GroupParameter, amount?: number): Promise<void> {
    group = await this.loadGroup(group);
    await this.lightManager.dimDown({ increment: amount }, group.entities);
  }

  @Trace()
  public async dimUp(group: GroupParameter, amount?: number): Promise<void> {
    group = await this.loadGroup(group);
    await this.lightManager.dimUp({ increment: amount }, group.entities);
  }

  @Trace()
  public async expandState(
    group: GroupDTO | string,
    { brightness, hs_color }: LightingCacheDTO,
  ): Promise<void> {
    group = await this.loadGroup(group);
    await each(group.entities, async (entity, callback) => {
      if (!hs_color) {
        await this.lightManager.setAttributes(entity, {
          brightness,
        });
        return callback();
      }
      await this.lightManager.turnOn(entity, {
        brightness,
        hs_color,
      });
      callback();
    });
  }

  @Trace()
  public getState(
    group: GroupDTO<LightingCacheDTO>,
  ): RoomEntitySaveStateDTO<LightingCacheDTO>[] {
    return group.entities.map((id) => {
      const light = this.entityManager.getEntity<LightStateDTO>(id);
      return {
        entity_id: light.entity_id,
        extra: {
          brightness: light.attributes.brightness,
          hs_color: light.attributes.hs_color,
        },
        state: light.state,
      };
    });
  }

  @Trace()
  public isValidEntity(id: string): boolean {
    return domain(id) === HASS_DOMAINS.light;
  }

  @Trace()
  public async rotateColors(
    group: GroupParameter,
    direction: 'forward' | 'reverse' = 'forward',
  ): Promise<void> {
    group = await this.loadGroup(group);
    const states = this.getState(group);
    if (direction === 'forward') {
      states.unshift(states.pop());
    } else {
      states.push(states.shift());
    }
    await this.setState(group.entities, states);
  }

  /**
   * Set brightness for turned on entities of the group
   */
  @Trace()
  public async setBrightness(
    group: GroupParameter,
    brightness: number,
    turnOn = false,
  ): Promise<void> {
    group = await this.loadGroup(group);
    const states = this.getState(group);
    await eachLimit(
      group.entities.map((entity, index) => {
        return [entity, states[index]];
      }) as [string, RoomEntitySaveStateDTO<LightingCacheDTO>][],
      this.eachLimit,
      async ([id, state], callback) => {
        if (state?.state !== 'on' && turnOn === false) {
          return callback();
        }
        await this.lightManager.setAttributes(id, { brightness });
        callback();
      },
    );
  }

  @Trace()
  public async turnOff(group: GroupParameter): Promise<void> {
    group = await this.loadGroup(group);
    await this.lightManager.turnOff(group.entities);
  }

  @Trace()
  public async turnOn(
    group: GroupParameter,
    circadian = false,
    brightness?: number,
  ): Promise<void> {
    group = await this.loadGroup(group);
    if (circadian) {
      await this.lightManager.circadianLight(group.entities, brightness);
      return;
    }
    await this.lightManager.turnOn(group.entities, {
      brightness,
    });
  }

  @Trace()
  protected async setState(
    entites: string[],
    state: RoomEntitySaveStateDTO[],
  ): Promise<void> {
    if (entites.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entites.length);
    }
    await eachLimit(
      state.map((state, index) => {
        return [entites[index], state];
      }) as [string, RoomEntitySaveStateDTO<LightingCacheDTO>][],
      this.eachLimit,
      async ([id, state], callback) => {
        if (state.state === 'off') {
          await this.lightManager.turnOff(id);
          return callback();
        }
        switch (state.extra.mode) {
          case LIGHTING_MODE.circadian:
            await this.lightManager.circadianLight(id, state.extra.brightness);
            break;
          case LIGHTING_MODE.on:
          default:
            await this.lightManager.turnOn(id, {
              brightness: state.extra.brightness,
              hs_color: state.extra.hs_color,
            });
            break;
        }
        callback();
      },
    );
  }
}
