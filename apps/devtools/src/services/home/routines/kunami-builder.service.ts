import {
  GROUP_TYPES,
  GroupDTO,
  KunamiSensorCommand,
  KunamiSensorGroupCommand,
  RoomDTO,
  RoomSaveStateDTO,
} from '@automagical/controller-logic';
import { HASS_DOMAINS } from '@automagical/home-assistant';
import {
  CANCEL,
  PromptEntry,
  PromptMenuItems,
  PromptService,
} from '@automagical/tty';
import { AutoLogService, IsEmpty, sleep } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { EntityService } from '../entity.service';
import { GroupCommandService } from '../groups';
import { HomeFetchService } from '../home-fetch.service';
import { RoomStateService } from './room-state.service';

type SensorEvents = { match: string[]; sensor: string };

const DEFAULT_RECORD_DURATION = 5;
type GroupCommand = Pick<KunamiSensorGroupCommand, 'command' | 'saveStateId'>;

@Injectable()
export class KunamiBuilderService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly roomState: RoomStateService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly fetchService: HomeFetchService,
    private readonly groupService: GroupCommandService,
  ) {}

  public async build(): Promise<void> {
    //
  }

  public async buildRoomCommand(
    room: RoomDTO,
    current?: KunamiSensorCommand,
  ): Promise<KunamiSensorCommand> {
    room.save_states ??= [];

    // THE COMMAND KRAKEN!

    // Ask what to do
    let command = await this.promptService.menuSelect(
      [
        // Create a new state, then use it as the target action
        ['Set State (create new)', 'createState'],
        // Select from an existing option
        ...this.promptService.conditionalEntries<RoomSaveStateDTO | string>(
          !IsEmpty(room.save_states),
          [
            new inquirer.Separator(`Activate existing state`),
            ...(room.save_states.map((state) => [state.name, state]) as [
              string,
              RoomSaveStateDTO,
            ][]),
          ],
        ),
      ],
      `What to do on activate?`,
      room.save_states.find((state) => state.id === current?.saveStateId),
    );

    // Create new state, then treat it as if it were selected from the menu
    switch (command) {
      case CANCEL:
        return current;
      case 'createState':
        const [newState] = await this.roomState.create(room);
        command = newState;
        break;
    }

    if (typeof command === 'string') {
      throw new NotImplementedException();
    }
    const saveStateId = command.id;
    command = 'setState';
    let events: SensorEvents;
    if (current) {
      if (await this.promptService.confirm(`Replace saved events?`)) {
        events = await this.recordEvents();
      } else {
        const { match, sensor } = current;
        events = {
          match,
          sensor,
        };
      }
    } else {
      events = await this.recordEvents();
    }
    return {
      command,
      saveStateId,
      ...events,
    } as KunamiSensorCommand;
  }

  private async recordEvents(): Promise<SensorEvents> {
    console.log(
      [
        ``,
        chalk.bold`Select a sensor entity to watch for changes, then input a series of states to watch for.`,
        ``,
        chalk.yellow` - Recording starts after inputting a recording duration`,
        chalk.cyan`Times above 60s are not recommended`,
        chalk.yellow` - Input your state sequence using the recorded sensor`,
        chalk.cyan`Some sensors may use numeric states instead of words. This is normal`,
        ``,
      ].join(`\n`),
    );
    await sleep();
    const sensor = await this.entityService.pickOne([HASS_DOMAINS.sensor]);
    const duration = await this.promptService.number(
      `Record changes for x seconds`,
      DEFAULT_RECORD_DURATION,
    );
    console.log(chalk.green(`Recording`));
    const match = await this.fetchService.fetch<string[]>({
      body: { duration },
      method: 'post',
      url: `/entity/record/${sensor}`,
    });
    console.log(chalk.red(`Done`));
    this.logger.debug({ match }, `Observed states`);
    return {
      match,
      sensor,
    };
  }
}
