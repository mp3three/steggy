/* eslint-disable radar/no-identical-functions */
import {
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomStateDTO,
} from '@automagical/controller-logic';
import { domain, HASS_DOMAINS } from '@automagical/home-assistant';
import { DONE, ICONS, PromptEntry, PromptService } from '@automagical/tty';
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

import { EntityService } from '../entity.service';
import { GroupCommandService } from '../groups';
import { HomeFetchService } from '../home-fetch.service';
import { RoomCommandService } from './room-command.service';

const UP = 1;
const DOWN = -1;

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
  ): Promise<RoomStateDTO> {
    current.friendlyName = await this.promptService.friendlyName(
      current.friendlyName,
    );
    current.states ??= [];
    const states: RoomEntitySaveStateDTO[] = [
      ...(await this.buildEntities(room, current)),
      ...(await this.buildGroups(room, current)),
    ];
    // This log mostly exists to provide visual context after building group states
    // Easy to totally get lost
    console.log(chalk.gray`Saving state ${current.friendlyName}`);
    current.states = states;
    if (!current.id) {
      return await this.fetchService.fetch({
        body: current,
        method: 'post',
        url: `/room/${room._id}/state`,
      });
    }
    return await this.fetchService.fetch({
      body: current,
      method: 'put',
      url: `/room/${room._id}/state/${current.id}`,
    });
  }

  public async pickOne(room: RoomDTO, current?: RoomStateDTO): Promise<string> {
    const action = await this.promptService.pickOne<RoomStateDTO | string>(
      `Which state?`,
      [
        [`${ICONS.CREATE}Manual create`, 'create'],
        ...this.promptService.conditionalEntries(!IsEmpty(room.save_states), [
          new inquirer.Separator(chalk.white(`Current states`)),
          ...(room.save_states
            .map((state) => [state.friendlyName, state])
            .sort(([a], [b]) =>
              a > b ? UP : DOWN,
            ) as PromptEntry<RoomStateDTO>[]),
        ]),
      ],
      current,
    );
    if (action === 'create') {
      const state = await this.build(room);
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
          ...(room.save_states
            .map((state) => [state.friendlyName, state])
            .sort(([a], [b]) =>
              a > b ? UP : DOWN,
            ) as PromptEntry<RoomStateDTO>[]),
        ]),
        new inquirer.Separator(chalk.white(`Manipulate`)),
        [`${ICONS.CREATE}Create`, 'create'],
        [`${ICONS.DESTRUCTIVE}Remove all save states`, 'truncate'],
      ],
      `Pick state`,
    );
    switch (action) {
      case DONE:
        return room;
      case 'create':
        await this.build(room);
        room = await this.roomService.get(room._id);
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
    this.promptService.clear();
    this.promptService.scriptHeader(`Room State`);
    console.log(
      chalk`${ICONS.LINK} {bold.magenta POST} ${this.fetchService.getUrl(
        `/room/${room._id}/state/${state.id}`,
      )}`,
    );
    this.promptService.print(dump(state));
    console.log();
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.ACTIVATE}Activate`, 'activate'],
        [`${ICONS.EDIT}Edit`, 'edit'],
        [`${ICONS.DELETE}Delete`, 'delete'],
      ],
      `Room state`,
    );
    switch (action) {
      case DONE:
        return room;
      case 'activate':
        await this.fetchService.fetch({
          method: `post`,
          url: `/room/${room._id}/state/${state.id}`,
        });
        return room;
      case 'edit':
        const update = await this.build(room, state);
        room = await this.roomService.get(room._id);
        return await this.processState(room, update);
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${chalk.magenta.bold(
              state.friendlyName,
            )}? This cannot be undone`,
          ))
        ) {
          return await this.processState(room, state);
        }
        return await this.fetchService.fetch({
          method: 'delete',
          url: `/room/${room._id}/state/${state.id}`,
        });
    }
    throw new NotImplementedException();
  }

  private async buildEntities(
    room: RoomDTO,
    current: Partial<RoomStateDTO> = {},
  ): Promise<RoomEntitySaveStateDTO[]> {
    if (IsEmpty(room.entities)) {
      this.logger.warn(`No entities in room`);
      return [];
    }
    const hasEntityStates = !IsEmpty(
      current.states.filter(({ type }) => type === 'entity'),
    );
    if (hasEntityStates) {
      if (!(await this.promptService.confirm(`Update entities?`))) {
        return current.states.filter(({ type }) => type === 'entity');
      }
    } else if (
      !(await this.promptService.confirm(`Add entities to save state?`))
    ) {
      return [];
    }
    const states: RoomEntitySaveStateDTO[] = [];
    const list = await this.entityService.pickMany(
      // Filter out non-actionable domains
      room.entities
        .map(({ entity_id }) => entity_id)
        .filter(
          (entity_id) => ![HASS_DOMAINS.sensor].includes(domain(entity_id)),
        ),
      current.states
        .filter((state) => state.type === 'entity' && state.ref.includes('.'))
        .map(({ ref }) => ref),
    );
    // Things tend to do the same thing
    // Makes initial setup easier
    let lastState: RoomEntitySaveStateDTO;
    await eachSeries(list, async (entity_id) => {
      const found = current.states.find((i) => i.ref === entity_id) || {
        ...lastState,
        ref: entity_id,
      };
      const state = await this.entityService.createSaveCommand(
        entity_id,
        found,
      );
      lastState = state;
      state.type = 'entity';
      states.push(state);
    });
    return states;
  }

  private async buildGroups(
    room: RoomDTO,
    current: Partial<RoomStateDTO> = {},
  ): Promise<RoomEntitySaveStateDTO[]> {
    if (IsEmpty(room.groups)) {
      this.logger.warn(`No groups`);
      return [];
    }
    const hasGroups = !IsEmpty(
      current.states.filter(({ type }) => type === 'group'),
    );
    if (hasGroups) {
      if (!(await this.promptService.confirm(`Update groups?`))) {
        return current.states.filter(({ type }) => type === 'group');
      }
    } else if (
      !(await this.promptService.confirm(`Add groups to save state?`))
    ) {
      return [];
    }
    const states: RoomEntitySaveStateDTO[] = [];
    const list = await this.groupService.pickMany(
      room.groups,
      current.states
        .filter(({ type }) => type === 'group')
        .map(({ ref }) => ref),
    );
    await eachSeries(list, async (group) => {
      // console.log(
      //   chalk.bgCyanBright.black(`${group.friendlyName} save state`),
      // );
      const state = await this.groupService.createSaveCommand(
        group,
        current.states.find((i) => i.ref === group._id),
      );
      state.type = 'group';
      states.push(state);
      // console.log(chalk.bgMagentaBright.black(`Done`));
    });
    return states;
  }
}
