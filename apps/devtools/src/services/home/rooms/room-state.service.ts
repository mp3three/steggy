import {
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomSaveStateDTO,
} from '@automagical/controller-logic';
import { CANCEL, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { eachSeries } from 'async';
import inquirer from 'inquirer';

import { EntityService } from '../entity.service';
import { GroupCommandService, GroupStateService } from '../groups';
import { HomeFetchService } from '../home-fetch.service';

@Injectable()
export class RoomStateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly fetchService: HomeFetchService,
    private readonly groupState: GroupStateService,
    private readonly groupCommand: GroupCommandService,
  ) {}

  public async create(room: RoomDTO): Promise<RoomDTO> {
    const name = await this.promptService.string(`Name for save state`);
    const entities: RoomEntitySaveStateDTO[] = [];
    const groups: Record<string, string> = {};
    if (!IsEmpty(room.entities)) {
      const selected = await this.promptService.pickMany(
        `Which entities to include in save state`,
        room.entities.map((i) => i.entity_id),
      );
      await eachSeries(selected, async (entity, callback) => {
        entities.push(await this.entityService.createSaveState(entity));
        callback();
      });
    }
    if (!IsEmpty(room.groups)) {
      const selectedGroups = await this.groupCommand.pickMany(room.groups);
      await eachSeries(selectedGroups, async (group, callback) => {
        groups[group._id] = await this.groupCommand.roomSaveAction(group);
        callback();
      });
    }
    const saveState: RoomSaveStateDTO = {
      entities,
      groups,
      name,
    };
    return await this.fetchService.fetch<RoomDTO>({
      body: saveState,
      method: 'post',
      url: `/`,
    });
  }

  public async exec(room: RoomDTO): Promise<RoomDTO> {
    const action = await this.promptService.menuSelect<
      string | RoomSaveStateDTO
    >([
      ...(IsEmpty(room.save_states)
        ? []
        : [
            ...room.save_states.map((value) => ({ name: value.name, value })),
            new inquirer.Separator(),
          ]),
      ...this.promptService.itemsFromEntries([['Create', 'create']]),
    ]);
    switch (action) {
      case CANCEL:
        return room;
      case 'create':
        return await this.exec(await this.create(room));
    }
    if (typeof action === 'string') {
      this.logger.error({ action }, `Action not implemented`);
      return room;
    }

    return room;
  }

  public async processState(
    room: RoomDTO,
    state: RoomSaveStateDTO,
  ): Promise<RoomDTO> {
    const action = await this.promptService.menuSelect(
      this.promptService.itemsFromEntries([
        ['Activate', 'activate'],
        ['Delete', 'delete'],
        ['Modify', 'modify'],
      ]),
    );
    switch (action) {
      case CANCEL:
        return room;
      case 'delete':
        return await this.fetchService.fetch({
          method: 'delete',
          url: `/room/${room._id}/state/${state.id}`,
        });
      case 'activate':
        await this.fetchService.fetch({
          method: 'post',
          url: `/room/${room._id}/state/${state.id}`,
        });
        return room;
    }
    return room;
  }
}
