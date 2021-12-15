import { AutoLogService } from '@for-science/utilities';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { v4 as uuid } from 'uuid';

import type {
  GroupCommandDTO,
  ROOM_ENTITY_EXTRAS,
  RoomEntitySaveStateDTO,
} from '../../contracts';
import { GROUP_TYPES, GroupDTO, GroupSaveStateDTO } from '../../contracts';
import { GroupPersistenceService } from '../persistence';

const EXPECTED_REMOVE_AMOUNT = 1;

export abstract class BaseGroupService {
  public abstract readonly GROUP_TYPE: GROUP_TYPES;

  protected readonly groupPersistence: GroupPersistenceService;
  protected readonly logger: AutoLogService;

  public abstract activateCommand(
    group: GroupDTO | string,
    state: GroupCommandDTO,
  ): Promise<void>;
  public abstract getState(group: GroupDTO): Promise<RoomEntitySaveStateDTO[]>;
  public abstract isValidEntity(id: string): boolean;

  public async activateState(
    group: GroupDTO | string,
    stateId: string,
  ): Promise<void> {
    group = await this.loadGroup(group);
    const state = group.save_states.find(({ id }) => id === stateId);
    if (!state) {
      this.logger.warn(
        { group: group.friendlyName, stateId },
        `Invalid state for group`,
      );
      return;
    }
    this.logger.debug(
      `[${group.friendlyName}] set state {${state.friendlyName}}`,
    );
    await this.setState(group.entities, state.states);
  }

  public async addState<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    group: GroupDTO<GROUP_TYPE> | string,
    state: GroupSaveStateDTO<GROUP_TYPE>,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    group = await this.loadGroup(group);
    state.id = uuid();
    group.save_states ??= [];
    group.save_states.push(state);
    return await this.groupPersistence.update(group, group._id);
  }

  /**
   * Take the current state of the group and add it as a saved state
   */

  public async captureState(
    group: GroupDTO | string,
    name: string,
  ): Promise<string> {
    const id = uuid();
    group = await this.loadGroup(group);
    const states = await this.getState(group);
    group.save_states ??= [];
    group.save_states.push({
      friendlyName: name,
      id,
      states,
    });
    await this.groupPersistence.update(group, group._id);
    return id;
  }

  public async deleteState<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    group: GroupDTO<GROUP_TYPE> | string,
    remove: string,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    group = await this.loadGroup<GROUP_TYPE>(group);
    group.save_states ??= [];
    const length = group.save_states.length;
    group.save_states = group.save_states.filter(({ id }) => id !== remove);
    if (group.save_states.length !== length - EXPECTED_REMOVE_AMOUNT) {
      this.logger.warn(
        {
          actual: length - group.save_states.length,
          expected: EXPECTED_REMOVE_AMOUNT,
        },
        `Unexpected removal amount`,
      );
    }
    await this.groupPersistence.update(group, group._id);
    return group;
  }

  public async expandState(
    group: GroupDTO | string,
    state: ROOM_ENTITY_EXTRAS,
  ): Promise<void> {
    group = await this.loadGroup(group);
    this.logger.warn({ state }, `Group does not implement expandState`);
  }

  public async loadFromState(
    group: GroupDTO | string,
    load: string,
  ): Promise<void> {
    group = await this.loadGroup(group);
    const state = group.save_states?.find(({ id }) => id === load);
    if (!state) {
      throw new NotFoundException(`Bad state id ${load}`);
    }
    this.logger.info(
      { id: state.id },
      `Loading state [${group.friendlyName}] {${state.friendlyName}}`,
    );
    await this.setState(group.entities, state.states);
    this.logger.debug({ id: state.id }, `Done`);
  }

  protected abstract setState<
    EXTRA extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(entites: string[], state: RoomEntitySaveStateDTO<EXTRA>[]): Promise<void>;

  protected async loadGroup<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(group: GroupDTO<GROUP_TYPE> | string): Promise<GroupDTO<GROUP_TYPE>> {
    if (typeof group === 'string') {
      group = await this.groupPersistence.findById(group);
    }
    if (!group) {
      throw new BadRequestException(`Could not load group`);
    }
    return group;
  }

  protected validateState<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(state: GroupSaveStateDTO<GROUP_TYPE>): GroupSaveStateDTO<GROUP_TYPE> {
    return plainToInstance(GroupSaveStateDTO, state);
  }
}
