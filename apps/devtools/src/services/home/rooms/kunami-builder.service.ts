import {
  GROUP_TYPES,
  GroupDTO,
  KunamiSensorCommand,
  ROOM_ENTITY_TYPES,
  RoomDTO,
  RoomSaveStateDTO,
} from '@automagical/controller-logic';
import { domain, HASS_DOMAINS } from '@automagical/home-assistant';
import { CANCEL, PromptMenuItems, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty, sleep } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { EntityService } from '../entity.service';
import { GroupCommandService } from '../groups';
import { HomeFetchService } from '../home-fetch.service';
import { RoomStateService } from './room-state.service';

type SensorEvents = { match: string[]; sensor: string };

const DEFAULT_RECORD_DURATION = 5;

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

  public async buildGroupCommand(
    group?: GroupDTO,
  ): Promise<KunamiSensorCommand> {
    const actions: PromptMenuItems = [];
    if (group.type === GROUP_TYPES.lock) {
      actions.push(
        ...this.promptService.itemsFromEntries([
          ['Lock', 'lock'],
          ['Unlock', 'unlock'],
        ]),
      );
    }
    if (
      [GROUP_TYPES.fan, GROUP_TYPES.light, GROUP_TYPES.switch].includes(
        group.type,
      )
    ) {
      actions.push(
        ...this.promptService.itemsFromEntries([
          ['Turn On', 'turnOn'],
          ['Turn Off', 'turnOff'],
        ]),
      );
    }
    if (group.type === GROUP_TYPES.light) {
      actions.push(
        ...this.promptService.itemsFromEntries([
          ['Circadian Light', 'circadianLight'],
          ['Dim Down', 'dimDown'],
          ['Dim Up', 'dimUp'],
        ]),
      );
    }
    if (group.type === GROUP_TYPES.fan) {
      actions.push(
        ...this.promptService.itemsFromEntries([
          ['Fan Seed Up', 'fanSpeedUp'],
          ['Fan Speed Down', 'fanSpeedDown'],
        ]),
      );
    }
    if (!IsEmpty(group.save_states)) {
      actions.push({
        name: 'Set State',
        value: 'setState',
      });
    }

    const command = await this.promptService.pickOne(
      `Sequence action`,
      actions,
    );
    const out: Partial<KunamiSensorCommand> = {
      command,
    };
    if (command === 'setState') {
      out.saveStateId = await this.promptService.pickOne(
        `Which state`,
        group.save_states.map((save) => ({
          name: save.name,
          value: save.id,
        })),
      );
    }
    return out as KunamiSensorCommand;
  }

  public async buildRoomCommand(
    room: RoomDTO,
    current?: KunamiSensorCommand,
  ): Promise<KunamiSensorCommand> {
    const allGroups = await this.groupService.list();
    room.groups ??= [];
    const groups = allGroups.filter(({ _id }) => room.groups.includes(_id));

    // THE COMMAND KRAKEN!
    const actions = this.promptService.itemsFromEntries([
      // Gimme options
      ['Turn On', 'turnOn'],
      ['Turn Off', 'turnOff'],
      // If this has light entities / groups, then add dim options
      ...this.promptService.conditionalEntries(
        !IsEmpty(
          room.entities.filter(
            ({ entity_id }) => domain(entity_id) === HASS_DOMAINS.light,
          ),
        ) || !IsEmpty(groups.filter(({ type }) => type === GROUP_TYPES.light)),
        [
          ['Dim up', 'dimup'],
          ['Dim down', 'dimDown'],
        ],
      ),
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
    ]);

    // Ask what to do
    let command = await this.promptService.menuSelect(
      actions,
      `What to do on activate?`,
      current?.command,
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

    let saveStateId: string;
    let scope: ROOM_ENTITY_TYPES[];
    if (typeof command === 'string') {
      scope = await this.promptService.pickMany<ROOM_ENTITY_TYPES>(
        `Which entity scopes?`,
        Object.keys(ROOM_ENTITY_TYPES).map((key) => ({
          name: key,
          value: ROOM_ENTITY_TYPES[key],
        })),
        { default: current?.scope },
      );
    } else {
      saveStateId = command.id;
      command = 'setState';
    }
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
      scope,
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
