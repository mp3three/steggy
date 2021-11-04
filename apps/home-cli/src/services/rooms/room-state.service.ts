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

import { ICONS } from '../../typings';
import { EntityService } from '../entity.service';
import { GroupCommandService } from '../groups';
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
  ) {}

  public async build(
    room: RoomDTO,
    current: Partial<RoomStateDTO> = {},
  ): Promise<Omit<RoomStateDTO, 'id'>> {
    current.friendlyName = await this.promptService.friendlyName(
      current.friendlyName,
    );
    current.states ??= [];
    const states: RoomEntitySaveStateDTO[] = [];
    if (IsEmpty(room.entities)) {
      this.logger.warn(`No entities in room`);
    } else if (
      !IsEmpty(current.states.filter(({ type }) => type === 'room')) ||
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
      !IsEmpty(current.states.filter(({ type }) => type === 'group')) ||
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

  public async buildSaveState(
    current: Partial<RoutineCommandRoomStateDTO> = {},
  ): Promise<RoutineCommandRoomStateDTO> {
    current.room = await this.roomService.pickOne(current.room);
    current.state = await this.pickOne(current.room);
    return current as RoutineCommandRoomStateDTO;
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
      // Things that are gonna come back and bite me someday ...this
      // I don't know how/when, but I know it will
      // ... the copypasta
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
        [`${ICONS.CREATE}Manual create`, 'create'],
        [`${ICONS.CAPTURE}Capture current`, 'capture'],
        [`${ICONS.DESCRIBE}Describe current`, 'describe'],
        [`${ICONS.DESTRUCTIVE}Remove all save states`, 'truncate'],
      ],
      `Room state`,
    );
    switch (action) {
      case DONE:
        return room;
      case 'create':
        throw new NotImplementedException();
      case 'capture':
        throw new NotImplementedException();
      case 'describe':
        throw new NotImplementedException();
      case 'truncate':
        throw new NotImplementedException();
    }
    throw new NotImplementedException();
  }
  public async processStates(
    room: RoomDTO,
    current: RoomStateDTO[] = [],
  ): Promise<RoomStateDTO[]> {
    const action = await this.promptService.menuSelect([
      [`Add new`, `add`],
      new inquirer.Separator(chalk.white`Current states`),
      ...(current.map((item) => [
        item.friendlyName,
        item,
      ]) as PromptEntry<RoomStateDTO>[]),
    ]);
    switch (action) {
      case DONE:
        return current;
      case 'add':
        return await this.processStates(room, [
          ...current,
          (await this.build(room)) as RoomStateDTO,
        ]);
    }
    // const friendlyName = await this.
    // room.save_states.push({
    //   friendlyName: '',
    //   states: [],
    // });

    throw new NotImplementedException();
  }
}
