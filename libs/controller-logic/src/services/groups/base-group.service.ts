import {
  BASIC_STATE,
  GroupDTO,
  GroupPersistenceService,
} from '@automagical/controller-logic';
import { AutoLogService, Trace } from '@automagical/utilities';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

export abstract class BaseGroupService {
  protected readonly groupPersistence: GroupPersistenceService;
  protected readonly logger: AutoLogService;

  public abstract getState(group: GroupDTO): BASIC_STATE[];

  @Trace()
  public async activateState(
    group: GroupDTO | string,
    stateId: string,
  ): Promise<void> {
    group = await this.loadGroup(group);
    const state = group.states.find(({ id }) => id === stateId);
    if (!state) {
      throw new NotFoundException(`Cannot find state ${stateId}`);
    }
    this.logger.debug(`Activate state {${state.name}}`);
    await this.setState(group.entities, state.states);
  }

  /**
   * Take the current state of the group and add it as a saved state
   */
  @Trace()
  public async captureState(
    group: GroupDTO | string,
    name: string,
  ): Promise<string> {
    const id = uuid();
    group = await this.loadGroup(group);
    const states = this.getState(group);
    group.states ??= [];
    group.states.push({
      id,
      name,
      states,
    });
    await this.groupPersistence.update(group);
    return id;
  }

  @Trace()
  public async loadFromState(
    group: GroupDTO | string,
    load: string,
  ): Promise<void> {
    group = await this.loadGroup(group);
    const state = group.states?.find(({ id }) => id === load);
    if (!state) {
      throw new NotFoundException(`Bad state id ${load}`);
    }
    this.logger.info(
      { id: state.id },
      `Loading state [${group.friendlyName}] {${state.name}}`,
    );
    await this.setState(group.entities, state.states);
    this.logger.debug({ id: state.id }, `Done`);
  }

  protected abstract setState(
    entites: string[],
    state: BASIC_STATE[],
  ): Promise<void>;

  protected async loadGroup<T extends BASIC_STATE = BASIC_STATE>(
    group: GroupDTO<T> | string,
  ): Promise<GroupDTO<T>> {
    if (typeof group === 'string') {
      group = await this.groupPersistence.findById(group);
    }
    if (!group) {
      throw new BadRequestException(`Could not load group`);
    }
    return group;
  }
}
