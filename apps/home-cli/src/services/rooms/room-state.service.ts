import {
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomStateDTO,
} from '@automagical/controller-logic';
import { DONE, PromptEntry, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { ICONS } from '../../typings';
import { EntityService } from '../entity.service';
import { GroupCommandService } from '../groups';

@Injectable()
export class RoomStateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly groupService: GroupCommandService,
  ) {}

  public async build(
    room: RoomDTO,
    current?: RoomStateDTO,
  ): Promise<Omit<RoomStateDTO, 'id'>> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current.friendlyName,
    );
    const states: RoomEntitySaveStateDTO[] = [];

    if (IsEmpty(room.entities)) {
      this.logger.warn(`No entities in room`);
    } else if (
      await this.promptService.confirm(`Add entities to save state?`)
    ) {
      const list = await this.entityService.pickMany(
        room.entities.map(({ entity_id }) => entity_id),
      );
      await eachSeries(list, async (entity_id) =>
        states.push(await this.entityService.createSaveCommand(entity_id)),
      );
    }
    if (IsEmpty(room.groups)) {
      this.logger.warn(`No groups`);
    } else if (await this.promptService.confirm(`Add groups to save state?`)) {
      const groups = await this.groupService.pickMany(room.groups);
    }

    return {
      friendlyName,
      states: [],
    };
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
