import {
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomStateDTO,
} from '@automagical/controller-logic';
import { PromptEntry, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import inquirer from 'inquirer';
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

  public async build(room: RoomDTO): Promise<Omit<RoomStateDTO, 'id'>> {
    const friendlyName = await this.promptService.string(`Friendly name`);
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
        states.push(await this.entityService.createSaveState(entity_id)),
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

    return current;
  }
}
