import {
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomGroupSaveStateDTO,
  RoomSaveStateDTO,
  SaveStateDTO,
} from '@automagical/controller-logic';
import { CANCEL, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { eachSeries } from 'async';
import { encode } from 'ini';
import inquirer from 'inquirer';

import { EntityService } from '../entity.service';
import { GroupCommandService } from '../groups';
import { HomeFetchService } from '../home-fetch.service';

@Injectable()
export class RoomStateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly fetchService: HomeFetchService,
    private readonly groupCommand: GroupCommandService,
  ) {}

  public async create(room: RoomDTO): Promise<[SaveStateDTO, RoomDTO]> {
    const friendlyName = await this.promptService.string(`Friendly name`);
    if (room.save_states.some((state) => state.name === friendlyName)) {
      this.logger.error(`Choose a unique name`);
      return await this.create(room);
    }
    const entities: RoomEntitySaveStateDTO[] = await this.buildEntityList(room);
    const groups: RoomGroupSaveStateDTO[] = await this.buildGroupList(room);
    const newRoom = await this.fetchService.fetch<RoomDTO>({
      body: {
        entities,
        groups,
        name: friendlyName,
      } as RoomSaveStateDTO,
      method: 'post',
      url: `/room/${room._id}/state`,
    });
    return [
      newRoom.save_states.find(({ name }) => name === friendlyName),
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

  public async modify(
    room: RoomDTO,
    state: RoomSaveStateDTO,
  ): Promise<[RoomDTO, RoomSaveStateDTO]> {
    state.name = await this.promptService.string(`Friendly name`, state.name);
    state.entities ??= [];
    state.groups ??= [];
    if (await this.promptService.confirm(`Update entities?`)) {
      state.entities = await this.buildEntityList(room, state);
    }
    if (await this.promptService.confirm(`Update groups?`)) {
      state.groups = await this.buildGroupList(room, state);
    }
    room = await this.fetchService.fetch({
      body: state,
      method: 'put',
      url: `/room/${room._id}/state/${state.id}`,
    });
    state = room.save_states.find((saved) => saved.id === state.id);
    return [room, state];
  }

  public async processState(
    room: RoomDTO,
    state: RoomSaveStateDTO,
    defaultAction?: string,
  ): Promise<RoomDTO> {
    const action = await this.promptService.menuSelect(
      this.promptService.itemsFromEntries([
        ['Activate', 'activate'],
        ['Describe', 'describe'],
        ['Modify', 'modify'],
        ['Delete', 'delete'],
      ]),
      undefined,
      defaultAction,
    );
    switch (action) {
      case CANCEL:
        return room;
      case 'describe':
        console.log(encode(state));
        return await this.processState(room, state, action);
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
      case 'modify':
        [room, state] = await this.modify(room, state);
        return await this.processState(room, state, action);
    }
    return room;
  }

  private async buildEntityList(
    room: RoomDTO,
    { entities }: Pick<RoomSaveStateDTO, 'entities'> = {},
  ): Promise<RoomEntitySaveStateDTO[]> {
    entities ??= [];
    room.entities ??= [];
    if (IsEmpty(room.entities)) {
      if (!IsEmpty(entities)) {
        this.logger.error(`State contains entities, but room does not`);
      }
      return [];
    }
    const updated = await this.promptService.pickMany(
      `Entity list`,
      room.entities.map((i) => i.entity_id),
      { default: entities.map((i) => i.entity_id) },
    );
    const original = entities ?? [];
    const out = [];
    await eachSeries(updated, async (entity_id, callback) => {
      out.push(
        await this.entityService.createSaveState(
          entity_id,
          original.find((i) => i.entity_id === entity_id),
        ),
      );
      callback();
    });
    return out;
  }

  private async buildGroupList(
    room: RoomDTO,
    { groups }: Pick<RoomSaveStateDTO, 'groups'> = {},
  ): Promise<RoomGroupSaveStateDTO[]> {
    room.groups ??= [];
    groups ??= [];
    if (IsEmpty(room.groups)) {
      if (!IsEmpty(groups)) {
        this.logger.error(`State contains groups, but room does not`);
      }
      return [];
    }
    const updated = await this.groupCommand.pickMany(
      room.groups,
      groups.map((i) => i.group),
    );
    const out = [];
    await eachSeries(updated, async (item, callback) => {
      out.push(
        await this.groupCommand.roomSaveAction(
          item,
          groups.find(({ group }) => group == item._id),
        ),
      );
      callback();
    });
    return out;
  }
}
