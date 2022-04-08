import { AutoLogService } from '@steggy/boilerplate';
import {
  GROUP_TYPES,
  GroupCommandDTO,
  GroupDTO,
  RoomEntitySaveStateDTO,
} from '@steggy/controller-shared';
import {
  EntityManagerService,
  HomeAssistantCoreService,
} from '@steggy/home-assistant';
import {
  domain,
  HASS_DOMAINS,
  SwitchStateDTO,
} from '@steggy/home-assistant-shared';
import { each, START } from '@steggy/utilities';
import { Injectable } from '@nestjs/common';

import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';

@Injectable()
export class SwitchGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly hassCore: HomeAssistantCoreService,
    protected readonly groupPersistence: GroupPersistenceService,
  ) {
    super();
  }

  public readonly GROUP_TYPE = GROUP_TYPES.switch;

  public async activateCommand(
    group: GroupDTO | string,
    state: GroupCommandDTO,
    waitForChange = false,
  ): Promise<void> {
    switch (state.command) {
      case 'turnOff':
        await this.turnOff(group, waitForChange);
        return;
      case 'turnOn':
        await this.turnOn(group, waitForChange);
        return;
      case 'toggle':
        await this.toggle(group, waitForChange);
        return;
      default:
        await this.activateState(group, state.command, waitForChange);
    }
  }

  public async getState(group: GroupDTO): Promise<RoomEntitySaveStateDTO[]> {
    return await group.entities.map(id => {
      const light = this.entityManager.getEntity<SwitchStateDTO>(id);
      return {
        ref: light.entity_id,
        state: light.state,
      };
    });
  }

  public isValidEntity(id: string): boolean {
    return [
      HASS_DOMAINS.switch,
      HASS_DOMAINS.fan,
      HASS_DOMAINS.light,
      HASS_DOMAINS.media_player,
    ].includes(domain(id));
  }

  public async setState(
    entities: string[],
    state: RoomEntitySaveStateDTO[],
  ): Promise<void> {
    if (entities.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entities.length);
    }
    await each(
      state.map((state, index) => {
        return [entities[index], state];
      }) as [string, RoomEntitySaveStateDTO][],
      async ([id, state]) => {
        if (state.state === 'off') {
          await this.hassCore.turnOff(id);
          return;
        }
        await this.hassCore.turnOn(id);
      },
    );
  }

  public async toggle(
    group: GroupDTO | string,
    waitForChange = false,
  ): Promise<void> {
    group = await this.loadGroup(group);
    await this.hassCore.toggle(group.entities, waitForChange);
  }

  public async turnOff(
    group: GroupDTO | string,
    waitForChange = false,
  ): Promise<void> {
    group = await this.loadGroup(group);
    await this.hassCore.turnOff(group.entities, waitForChange);
  }

  public async turnOn(
    group: GroupDTO | string,
    waitForChange = false,
  ): Promise<void> {
    group = await this.loadGroup(group);
    await this.hassCore.turnOn(group.entities, waitForChange);
  }
}
