/* eslint-disable radar/no-identical-functions */
import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import {
  GeneralSaveStateDTO,
  PersonDTO,
  RoomStateDTO,
} from '@steggy/controller-shared';
import { domain, HASS_DOMAINS } from '@steggy/home-assistant-shared';
import {
  ApplicationManagerService,
  IsDone,
  PromptEntry,
  PromptService,
  ScreenService,
  SyncLoggerService,
  TextRenderingService,
  ToMenuEntry,
} from '@steggy/tty';
import {
  DOWN,
  FILTER_OPERATIONS,
  is,
  LABEL,
  UP,
  VALUE,
} from '@steggy/utilities';
import { eachSeries } from 'async';
import chalk from 'chalk';
import Table from 'cli-table';

import { MENU_ITEMS } from '../../includes';
import { ICONS } from '../../types';
import { GroupCommandService } from '../groups';
import { EntityService } from '../home-assistant';
import { HomeFetchService } from '../home-fetch.service';
import { PinnedItemService } from '../pinned-item.service';
import { PersonCommandService } from './person-command.service';

type PCService = PersonCommandService;
@Injectable()
export class PersonStateService {
  constructor(
    private readonly logger: SyncLoggerService,
    private readonly promptService: PromptService,
    @Inject(forwardRef(() => PersonCommandService))
    private readonly personService: PCService,
    private readonly entityService: EntityService,
    private readonly textRender: TextRenderingService,
    private readonly groupService: GroupCommandService,
    private readonly fetchService: HomeFetchService,
    private readonly pinnedItems: PinnedItemService,
    private readonly applicationManager: ApplicationManagerService,
    private readonly screenService: ScreenService,
  ) {}

  public async activate(
    person: PersonDTO,
    state: RoomStateDTO | string,
  ): Promise<void> {
    await this.fetchService.fetch({
      method: `post`,
      url: `/person/${person._id}/state/${is.string(state) ? state : state.id}`,
    });
  }

  public async build(
    person: PersonDTO,
    current: Partial<RoomStateDTO> = {},
  ): Promise<RoomStateDTO> {
    current.friendlyName =
      current.friendlyName ??
      (await this.promptService.friendlyName(current.friendlyName));
    current.states ??= [];
    const states: GeneralSaveStateDTO[] = [
      ...(await this.buildEntities(person, current)),
      ...(await this.buildGroups(person, current)),
    ];
    // This log mostly exists to provide visual context after building group states
    // Easy to totally get lost
    this.screenService.print(chalk.gray`Saving state ${current.friendlyName}`);
    current.states = states;
    if (!current.id) {
      return await this.fetchService.fetch({
        body: current,
        method: 'post',
        url: `/person/${person._id}/state`,
      });
    }
    return await this.fetchService.fetch({
      body: current,
      method: 'put',
      url: `/person/${person._id}/state/${current.id}`,
    });
  }

  public async pickOne(
    person: PersonDTO,
    current?: RoomStateDTO,
  ): Promise<string> {
    const action = await this.promptService.menu({
      right: ToMenuEntry(
        person.save_states.map(state => [state.friendlyName, state]),
      ),
      value: current,
    });
    if (is.string(action)) {
      throw new NotImplementedException();
    }
    return action.id;
  }

  public async process(person: PersonDTO): Promise<PersonDTO> {
    this.applicationManager.setHeader(person.friendlyName, 'Person States');
    const action = await this.promptService.menu({
      keyMap: {
        a: MENU_ITEMS.ACTIVATE,
        d: MENU_ITEMS.DONE,
        f12: [`${ICONS.DESTRUCTIVE}Remove all save states`, 'truncate'],
      },
      keyMapCallback: async (action: string, [name, target]) => {
        if (is.string(target) || action !== 'activate') {
          return true;
        }
        await this.activate(person, target as RoomStateDTO);
        return chalk.magenta.bold(MENU_ITEMS.ACTIVATE[LABEL]) + ' ' + name;
      },
      right: ToMenuEntry(
        person.save_states
          .map(state => [state.friendlyName, state])
          .sort(([a], [b]) =>
            a > b ? UP : DOWN,
          ) as PromptEntry<RoomStateDTO>[],
      ),
      rightHeader: `Pick state`,
    });
    if (IsDone(action)) {
      return person;
    }
    // eslint-disable-next-line radar/no-small-switch
    switch (action) {
      case 'truncate':
        if (
          !(await this.promptService.confirm(
            `This is a destructive operation, are you sure?`,
          ))
        ) {
          return await this.process(person);
        }
        person.save_states = [];
        person = await this.personService.update(person);
        return await this.process(person);
    }
    if (is.string(action)) {
      throw new NotImplementedException();
    }
    person = await this.processState(person, action);
    return await this.process(person);
  }

  public async processState(
    person: PersonDTO,
    state: RoomStateDTO,
    defaultAction?: string,
  ): Promise<PersonDTO> {
    if (defaultAction !== 'activate') {
      this.applicationManager.setHeader(
        person.friendlyName,
        state.friendlyName,
      );
    }
    let action = await this.promptService.menu({
      keyMap: {
        a: MENU_ITEMS.ACTIVATE,
        d: MENU_ITEMS.DONE,
        e: MENU_ITEMS.EDIT,
        f1: MENU_ITEMS.DESCRIBE,
        n: MENU_ITEMS.RENAME,
        p: [
          this.pinnedItems.isPinned('person_state', state.id) ? 'Unpin' : 'Pin',
          'pin',
        ],
        r: [`${ICONS.PEOPLE}Go to person`, `person`],
        x: MENU_ITEMS.DELETE,
      },
      keyMapCallback: action => {
        if (action !== MENU_ITEMS.ACTIVATE[VALUE]) {
          return true;
        }
        process.nextTick(async () => {
          await this.activate(person, state);
        });
        return chalk.magenta.bold(MENU_ITEMS.ACTIVATE[LABEL]);
      },
      keyOnly: true,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return person;
    }
    action ??= 'activate';
    switch (action) {
      case 'describe':
        await this.header(person, state);
        return await this.processState(person, state, action);
      case 'rename':
        state.friendlyName = await this.promptService.friendlyName(
          state.friendlyName,
        );
        await this.update(state, person);
        return await this.processState(person, state, action);
      case 'person':
        await this.personService.processPerson(person);
        person = await this.personService.get(person._id);
        return person;
      case 'pin':
        this.pinnedItems.toggle({
          target: state.id,
          type: 'person_state',
        });
        return await this.processState(person, state, action);
      case 'activate':
        await this.activate(person, state);
        return await this.processState(person, state, action);
      case 'edit':
        const update = await this.build(person, state);
        person = await this.personService.get(person._id);
        return await this.processState(person, update);
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${chalk.magenta.bold(
              state.friendlyName,
            )}? This cannot be undone`,
          ))
        ) {
          return await this.processState(person, state);
        }
        return await this.fetchService.fetch({
          method: 'delete',
          url: `/person/${person._id}/state/${state.id}`,
        });
    }
    throw new NotImplementedException();
  }

  public async update(current: RoomStateDTO, person: PersonDTO): Promise<void> {
    return await this.fetchService.fetch({
      body: current,
      method: 'put',
      url: `/person/${person._id}/state/${current.id}`,
    });
  }

  protected onModuleInit(): void {
    this.pinnedItems.loaders.set('person_state', async ({ target }) => {
      await this.fetchService.fetch({
        method: 'post',
        url: `/person/state/${target}`,
      });
    });
  }

  private async buildEntities(
    person: PersonDTO,
    current: Partial<RoomStateDTO> = {},
  ): Promise<GeneralSaveStateDTO[]> {
    if (is.empty(person.entities)) {
      this.logger.warn(`No entities in person`);
      return [];
    }

    const states: GeneralSaveStateDTO[] = [];
    const list = await this.entityService.pickMany(
      // Filter out non-actionable domains
      person.entities
        .map(({ entity_id }) => entity_id)
        .filter(
          entity_id => ![HASS_DOMAINS.sensor].includes(domain(entity_id)),
        ),
      current.states
        .filter(state => state.type === 'entity' && state.ref.includes('.'))
        .map(({ ref }) => ref),
    );
    // Things tend to do the same thing
    // Makes initial setup easier
    let lastState: GeneralSaveStateDTO;
    await eachSeries(list, async entity_id => {
      const found = current.states.find(i => i.ref === entity_id) || {
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
    person: PersonDTO,
    current: Partial<RoomStateDTO> = {},
  ): Promise<GeneralSaveStateDTO[]> {
    if (is.empty(person.groups)) {
      this.logger.warn(`No groups`);
      return [];
    }
    const states: GeneralSaveStateDTO[] = [];
    const list = await this.groupService.pickMany(
      person.groups,
      current.states
        .filter(({ type }) => type === 'group')
        .map(({ ref }) => ref),
    );
    await eachSeries(list, async group => {
      const state = await this.groupService.createSaveCommand(
        group,
        current.states.find(i => i.ref === group._id),
      );
      state.type = 'group';
      states.push(state);
    });
    return states;
  }

  private async header(person: PersonDTO, state: RoomStateDTO): Promise<void> {
    this.screenService.print(
      chalk`  ${
        ICONS.LINK
      }{bold.magenta POST} {underline ${this.fetchService.getUrl(
        `/person/${person._id}/state/${state.id}`,
      )}}`,
    );
    const entities = state.states.filter(({ type }) => type === 'entity');
    if (is.empty(entities)) {
      this.screenService.print(
        chalk`  ${ICONS.ENTITIES} {blue No entities included in save state}\n`,
      );
    } else {
      const table = new Table({
        head: ['Entity ID', 'State', 'Extra'],
      });
      entities
        .sort((a, b) => (a.ref > b.ref ? UP : DOWN))
        .forEach(entity => {
          table.push([
            entity.ref ?? '',
            entity.state ?? '',
            this.textRender.typePrinter(entity.extra),
          ]);
        });
      console.log(
        [
          ``,
          chalk`  ${ICONS.ENTITIES}{blue.bold Entity States}`,
          table.toString(),
        ].join(`\n`),
      );
    }
    const groupStates = state.states.filter(({ type }) => type === 'group');
    if (is.empty(groupStates)) {
      this.screenService.print(
        chalk`  ${ICONS.GROUPS}{blue No groups included in save state}\n`,
      );
      return;
    }
    const table = new Table({
      head: ['Entity ID', 'State'],
    });
    const ids = is.unique(groupStates.map(({ ref }) => ref));
    const groups = await this.groupService.list({
      filters: new Set([
        {
          field: '_id',
          operation: FILTER_OPERATIONS.in,
          value: ids,
        },
      ]),
    });
    groupStates.forEach(state => {
      const group = groups.find(({ _id }) => _id === state.ref);
      const saveState = group.save_states.find(({ id }) => id === state.state);
      table.push([group.friendlyName, saveState?.friendlyName]);
    });
    this.screenService.print(
      [
        ``,
        chalk`  ${ICONS.GROUPS}{blue.bold Group States}`,
        table.toString(),
        ``,
      ].join(`\n`),
    );
  }
}
