import {
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomSaveStateDTO,
} from '@automagical/controller-logic';
import { CANCEL, PromptService } from '@automagical/tty';
import { IsEmpty } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { eachSeries } from 'async';

import { EntityService } from '../entity.service';
import { GroupCommandService, GroupStateService } from '../groups';
import { HomeFetchService } from '../home-fetch.service';

@Injectable()
export class RoomStateService {
  constructor(
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
    const action = await this.promptService.menuSelect([
      ...this.promptService.itemsFromEntries([['Create', 'create']]),
    ]);
    switch (action) {
      case CANCEL:
        return room;
      case 'create':
        return await this.exec(await this.create(room));
    }
    return room;
  }
}
