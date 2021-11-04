/* eslint-disable radar/no-identical-functions */
import {
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomStateDTO,
  RoutineCommandRoomStateDTO,
} from '@automagical/controller-logic';
import { DONE, PromptEntry, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { dump } from 'js-yaml';

import { ICONS } from '../../typings';
import { EntityService } from '../entity.service';
import { GroupCommandService } from '../groups';
import { HomeFetchService } from '../home-fetch.service';
import { RoomCommandService } from './room-command.service';

@Injectable()
export class RoomStateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    @Inject(forwardRef(() => RoomCommandService))
    private readonly roomService: RoomCommandService,
    private readonly entityService: EntityService,
    private readonly groupService: GroupCommandService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async build(
    room: RoomDTO,
    current: Partial<RoomStateDTO> = {},
  ): Promise<Omit<RoomStateDTO, 'id'>> {
    current.states ??= [];
    const states: RoomEntitySaveStateDTO[] = [];
    if (IsEmpty(room.entities)) {
      this.logger.warn(`No entities in room`);
    } else if (
      (!IsEmpty(current.states.filter(({ type }) => type === 'room')) &&
        (await this.promptService.confirm(`Update entities?`))) ||
      (await this.promptService.confirm(`Add entities to save state?`))
    ) {
      const list = await this.entityService.pickMany(
        room.entities.map(({ entity_id }) => entity_id),
        current.states
          .filter((state) => state.type === 'room' && state.ref.includes('.'))
          .map(({ ref }) => ref),
      );
      await eachSeries(list, async (entity_id) =>
        states.push(
          await this.entityService.createSaveCommand(
            entity_id,
            current.states.find((i) => i.ref === entity_id),
          ),
        ),
      );
    }
    if (IsEmpty(room.groups)) {
      this.logger.warn(`No groups`);
    } else if (
      (!IsEmpty(current.states.filter(({ type }) => type === 'group')) &&
        (await this.promptService.confirm('Update groups?'))) ||
      (await this.promptService.confirm(`Add groups to save state?`))
    ) {
      const list = await this.groupService.pickMany(room.groups);
      await eachSeries(list, async (group) =>
        states.push(
          await this.groupService.createSaveCommand(
            group,
            current.states.find((i) => i.ref === group._id),
          ),
        ),
      );
    }
    return current as RoomStateDTO;
  }

  public async createFor(room: RoomDTO): Promise<RoomDTO> {
    const state = await this.build(room);
    return await this.fetchService.fetch({
      body: state,
      method: 'post',
      url: `/room/${room._id}/state`,
    });
  }

  public async loadBuild(
    current?: RoutineCommandRoomStateDTO,
  ): Promise<RoutineCommandRoomStateDTO> {
    const room = await this.roomService.pickOne(current.room);
    const state = await this.pickOne(room);
    return {
      room: room._id,
      state,
    };
  }

  public async pickOne(room: RoomDTO): Promise<string> {
    const action = await this.promptService.pickOne<RoomStateDTO | string>(
      `Which state?`,
      [
        [`${ICONS.CREATE}Manual create`, 'create'],
        ...this.promptService.conditionalEntries(!IsEmpty(room.save_states), [
          new inquirer.Separator(chalk.white(`Current states`)),
          ...(room.save_states.map((state) => [
            state.friendlyName,
            state,
          ]) as PromptEntry<RoomStateDTO>[]),
        ]),
      ],
    );
    if (action === 'create') {
      room = await this.build(room);
      await this.roomService.update(room);
      const state = room.save_states.pop();
      return state.id;
    }
    if (typeof action === 'string') {
      throw new NotImplementedException();
    }
    return action.id;
  }

  public async process(room: RoomDTO): Promise<RoomDTO> {
    const action = await this.promptService.menuSelect(
      [
        ...this.promptService.conditionalEntries(!IsEmpty(room.save_states), [
          new inquirer.Separator(chalk.white(`Current states`)),
          ...(room.save_states.map((state) => [
            state.friendlyName,
            state,
          ]) as PromptEntry<RoomStateDTO>[]),
        ]),
        new inquirer.Separator(chalk.white(`Manipulate`)),
        [`${ICONS.CREATE}Create`, 'create'],
        [`${ICONS.DESTRUCTIVE}Remove all save states`, 'truncate'],
      ],
      `Room state`,
    );
    switch (action) {
      case DONE:
        return room;
      case 'create':
        room = await this.createFor(room);
        return await this.process(room);
      case 'truncate':
        if (
          !(await this.promptService.confirm(
            `This is a desctructive operation, are you sure?`,
          ))
        ) {
          return await this.process(room);
        }
        room.save_states = [];
        room = await this.roomService.update(room);
        return await this.process(room);
    }
    if (typeof action === 'string') {
      throw new NotImplementedException();
    }
    room = await this.processState(room, action);
    return await this.process(room);
  }

  public async processState(
    room: RoomDTO,
    state: RoomStateDTO,
  ): Promise<RoomDTO> {
    const action = await this.promptService.menuSelect([
      [`${ICONS.ACTIVATE}Activate`, 'activate'],
      [`${ICONS.EDIT}Edit`, 'edit'],
      [`${ICONS.DESCRIBE}Describe`, 'describe'],
      [`${ICONS.DELETE}Delete`, 'remove'],
    ]);
    switch (action) {
      case DONE:
        return room;
      case 'activate':
        await this.fetchService.fetch({
          method: `post`,
          url: `/room/${room._id}/state/${state.id}`,
        });
        return room;
      case 'describe':
        this.promptService.print(dump(state));
        return await this.processState(room, state);
      case 'edit':
        const update = await this.build(room, state);
        room = await this.fetchService.fetch({
          body: update,
          method: 'put',
          url: `/room/${room._id}/state/${state.id}`,
        });
        return await this.processState(
          room,
          room.save_states.find(({ id }) => id === state.id),
        );
      case 'remove':
        return await this.fetchService.fetch({
          method: 'delete',
          url: `/room/${room._id}/state/${state.id}`,
        });
    }
    throw new NotImplementedException();
  }
}
