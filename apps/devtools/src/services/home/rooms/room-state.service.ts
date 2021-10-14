import {
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomGroupSaveStateDTO,
  RoomSaveStateDTO,
} from '@automagical/controller-logic';
import { CANCEL, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import figlet from 'figlet';
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
    private readonly groupState: GroupStateService,
    private readonly fetchService: HomeFetchService,
    private readonly groupCommand: GroupCommandService,
  ) {}

  /**
   * Indecisive return value, pick the one you need
   */
  public async create(room: RoomDTO): Promise<[RoomSaveStateDTO, RoomDTO]> {
    const name = await this.promptService.string(`Name for save state`);
    if (room.save_states.some((state) => state.name === name)) {
      this.logger.error(`Choose a unique name`);
      return await this.create(room);
    }
    const entities: RoomEntitySaveStateDTO[] = [];
    const groups: RoomGroupSaveStateDTO[] = [];
    if (!IsEmpty(room.entities)) {
      console.log(
        chalk.magenta(figlet.textSync('Entities', { font: 'ANSI Regular' })),
      );
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
        groups.push(await this.groupCommand.roomSaveAction(group));
        callback();
      });
    }
    const saveState: RoomSaveStateDTO = {
      entities,
      groups,
      name,
    };
    const newRoom = await this.fetchService.fetch<RoomDTO>({
      body: saveState,
      method: 'post',
      url: `/room/${room._id}/state`,
    });
    return [
      newRoom.save_states.find(({ name }) => name === saveState.name),
      newRoom,
    ];
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
        const [, updatedRoom] = await this.create(room);
        return await this.exec(updatedRoom);
    }
    if (typeof action === 'string') {
      this.logger.error({ action }, `Action not implemented`);
      return room;
    }
    room = await this.processState(room, action);
    return await this.exec(room);
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
