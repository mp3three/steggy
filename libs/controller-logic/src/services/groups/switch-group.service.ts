import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@automagical/boilerplate';
import {
  GROUP_TYPES,
  GroupCommandDTO,
  GroupDTO,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-shared';
import {
  EntityManagerService,
  HomeAssistantCoreService,
} from '@automagical/home-assistant';
import {
  domain,
  HASS_DOMAINS,
  SwitchStateDTO,
} from '@automagical/home-assistant-shared';
import { each } from '@automagical/utilities';

import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';

const START = 0;
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
  ): Promise<void> {
    switch (state.command) {
      case 'turnOff':
        await this.turnOff(group);
        return;
      case 'turnOn':
        await this.turnOn(group);
        return;
      case 'toggle':
        await this.toggle(group);
        return;
      default:
        await this.activateState(group, state.command);
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

  public async toggle(group: GroupDTO | string): Promise<void> {
    group = await this.loadGroup(group);
    await this.hassCore.toggle(group.entities);
  }

  public async turnOff(group: GroupDTO | string): Promise<void> {
    group = await this.loadGroup(group);
    await this.hassCore.turnOff(group.entities);
  }

  public async turnOn(group: GroupDTO | string): Promise<void> {
    group = await this.loadGroup(group);
    await this.hassCore.turnOn(group.entities);
  }
}
