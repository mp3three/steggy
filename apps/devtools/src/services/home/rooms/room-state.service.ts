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

  public async create(room: RoomDTO): Promise<RoomSaveStateDTO> {
    const name = await this.promptService.string(`Name for save state`);
    const entities: RoomEntitySaveStateDTO[] = [];
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
      // const selected = await this.promptService.pickMany(
      //   `Which groups to include in save state`,
      //   room.groups.map((i) => i.entity_id),
      // );
    }
    return {
      entities,
      name,
    };
  }

  public async exec(room: RoomDTO): Promise<RoomDTO> {
    const action = await this.promptService.menuSelect([
      ...this.promptService.itemsFromTuple([['Create', 'create']]),
    ]);
    switch (action) {
      case CANCEL:
        return room;
      case 'create':
        break;
    }
    return room;
  }
}
