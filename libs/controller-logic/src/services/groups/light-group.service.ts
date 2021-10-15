import {
  domain,
  EntityManagerService,
  HASS_DOMAINS,
  LightStateDTO,
} from '@automagical/home-assistant';
import { AutoLogService, InjectConfig, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { each, eachLimit } from 'async';

import { CONCURRENT_CHANGES, DIM_PERCENT } from '../../config';
import {
  BASIC_STATE,
  GROUP_TYPES,
  GroupDTO,
  LIGHTING_MODE,
  PersistenceLightStateDTO,
  RoomGroupSaveStateDTO,
} from '../../contracts';
import { LightManagerService } from '../light-manager.service';
import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';

type GroupParameter = GroupDTO<PersistenceLightStateDTO> | string;
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
    state: RoomGroupSaveStateDTO,
  ): Promise<void> {
    switch (state.action) {
      case 'turnOff':
        await this.turnOff(group);
        return;
      case 'turnOn':
        await this.turnOn(group, false, state.extra?.brightness as number);
        return;
      case 'circadianLight':
        await this.turnOn(group, true, state.extra?.brightness as number);
        return;
      default:
        await this.activateState(group, state.action);
    }
  }

  @Trace()
  public async activateState(
    group: GroupParameter,
    stateId: string,
  ): Promise<void> {
    if (stateId === 'turnOn') {
      await this.turnOn(group);
      return;
    }
    if (stateId === 'turnOff') {
      await this.turnOff(group);
      return;
    }
    if (stateId === 'circadian') {
      await this.turnOn(group, true);
      return;
    }
    if (stateId === 'dimUp') {
      await this.dimUp(group);
      return;
    }
    if (stateId === 'dimDown') {
      await this.dimDown(group);
      return;
    }
    await super.activateState(group, stateId);
  }

  @Trace()
  public async dimDown(group: GroupParameter): Promise<void> {
    group = await this.loadGroup(group);
    await this.lightManager.dimDown({}, group.entities);
  }

  @Trace()
  public async dimUp(group: GroupParameter): Promise<void> {
    group = await this.loadGroup(group);
    await this.lightManager.dimUp({}, group.entities);
  }

  @Trace()
  public async expandState<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    group: GroupDTO<GROUP_TYPE> | string,
    { brightness, hs_color }: PersistenceLightStateDTO,
  ): Promise<GroupDTO<GROUP_TYPE>> {
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
    return group;
  }

  @Trace()
  public getState(
    group: GroupDTO<PersistenceLightStateDTO>,
  ): PersistenceLightStateDTO[] {
    return group.entities.map((id) => {
      const light = this.entityManager.getEntity<LightStateDTO>(id);
      return {
        brightness: light.attributes.brightness,
        hs_color: light.attributes.hs_color,
        state: light.state,
      } as PersistenceLightStateDTO;
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
      }) as [string, PersistenceLightStateDTO][],
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
    state: PersistenceLightStateDTO[],
  ): Promise<void> {
    if (entites.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entites.length);
    }
    await eachLimit(
      state.map((state, index) => {
        return [entites[index], state];
      }) as [string, PersistenceLightStateDTO][],
      this.eachLimit,
      async ([id, state], callback) => {
        if (state.state === 'off') {
          await this.lightManager.turnOff(id);
          return callback();
        }
        switch (state.mode) {
          case LIGHTING_MODE.circadian:
            await this.lightManager.circadianLight(id, state.brightness);
            break;
          case LIGHTING_MODE.on:
          default:
            await this.lightManager.turnOn(id, {
              brightness: state.brightness,
              hs_color: state.hs_color,
            });
            break;
        }
        callback();
      },
    );
  }
}
