import { AutoLogService } from '@automagical/boilerplate';
import {
  GROUP_TYPES,
  GroupCommandDTO,
  GroupDTO,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-shared';
import {
  EntityManagerService,
  FanDomainService,
  HomeAssistantCoreService,
} from '@automagical/home-assistant';
import {
  domain,
  FanAttributesDTO,
  FanStateDTO,
  HASS_DOMAINS,
} from '@automagical/home-assistant-shared';
import { each, START } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { EntityCommandRouterService } from '../entity-command-router.service';
import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';

type SaveState = RoomEntitySaveStateDTO<FanAttributesDTO>;

@Injectable()
export class FanGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    protected readonly groupPersistence: GroupPersistenceService,
    private readonly hassCore: HomeAssistantCoreService,
    private readonly entityManager: EntityManagerService,
    private readonly fanDomain: FanDomainService,
    private readonly commandRouter: EntityCommandRouterService,
  ) {
    super();
  }
  public readonly GROUP_TYPE: GROUP_TYPES.fan;

  public async activateCommand(
    group: GroupDTO<FanAttributesDTO> | string,
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
      case 'fanSpeedUp':
        await this.fanSpeedUp(group, waitForChange);
        return;
      case 'fanSpeedDown':
        await this.fanSpeedDown(group, waitForChange);
        return;
      default:
        await this.activateState(group, state.command, waitForChange);
    }
  }

  public async fanSpeedDown(
    group: GroupDTO | string,
    waitForChange = false,
  ): Promise<void> {
    group = await this.loadGroup(group);
    await each(
      group.entities,
      async entity_id =>
        await this.fanDomain.fanSpeedDown(entity_id, waitForChange),
    );
  }

  public async fanSpeedUp(
    group: GroupDTO | string,
    waitForChange = false,
  ): Promise<void> {
    group = await this.loadGroup(group);
    await each(
      group.entities,
      async entity_id =>
        await this.commandRouter.process(
          entity_id,
          'fanSpeedUp',
          undefined,
          waitForChange,
        ),
    );
  }

  public async getState(
    group: GroupDTO<FanAttributesDTO>,
  ): Promise<SaveState[]> {
    return await group.entities.map(id => {
      const fan = this.entityManager.getEntity<FanStateDTO>(id);
      return {
        extra: {
          speed: fan.attributes.speed,
        },
        ref: fan.entity_id,
        state: fan.state,
      } as SaveState;
    });
  }

  public isValidEntity(id: string): boolean {
    return domain(id) === HASS_DOMAINS.fan;
  }

  public async setState(
    entities: string[],
    state: RoomEntitySaveStateDTO[],
    waitForChange = false,
  ): Promise<void> {
    if (entities.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entities.length);
    }
    await each(
      state.map((state, index) => {
        return [entities[index], state];
      }) as [string, RoomEntitySaveStateDTO<FanAttributesDTO>][],
      async ([id, state]) => {
        if (state.state === 'off') {
          await this.fanDomain.turnOff(id, waitForChange);
          return;
        }
        await this.fanDomain.setSpeed(
          id,
          state.extra.percentage,
          waitForChange,
        );
      },
    );
  }

  public async turnOff(
    group: GroupDTO<FanAttributesDTO> | string,
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
