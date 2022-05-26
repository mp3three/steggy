import { Injectable, NotImplementedException } from '@nestjs/common';
import { CacheManagerService, InjectCache } from '@steggy/boilerplate';
import {
  GroupDTO,
  PersonDTO,
  RoomDTO,
  RoomEntityDTO,
} from '@steggy/controller-shared';
import { HASS_DOMAINS } from '@steggy/home-assistant-shared';
import {
  ApplicationManagerService,
  IsDone,
  MainMenuEntry,
  PromptEntry,
  PromptService,
  SyncLoggerService,
  ToMenuEntry,
} from '@steggy/tty';
import { DOWN, FILTER_OPERATIONS, is, LABEL, UP } from '@steggy/utilities';
import chalk from 'chalk';

import { MENU_ITEMS } from '../../includes';
import { ICONS } from '../../types';
import { GroupCommandService } from '../groups/group-command.service';
import { EntityService } from '../home-assistant/entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { PinnedItemService } from '../pinned-item.service';
import { RoomCommandService } from '../rooms';
import { PersonStateService } from './person-state.service';

const CACHE_KEY = 'MENU_LAST_PERSON';

type tGroup = { group: GroupDTO };
type tRoom = { room: RoomDTO };
type tEntity = { entity_id: string };

// @Repl({
//   category: `Control`,
//   icon: ICONS.personS,
//   keybind: 'r',
//   name: `persons`,
// })
@Injectable()
export class PersonCommandService {
  constructor(
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly logger: SyncLoggerService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly groupCommand: GroupCommandService,
    private readonly entityService: EntityService,
    private readonly personState: PersonStateService,
    private readonly roomService: RoomCommandService,
    private readonly pinnedItems: PinnedItemService,
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  private lastPerson: string;

  // public async create(): Promise<PersonDTO> {
  //   const friendlyName = await this.promptService.friendlyName();
  //   const entities = (await this.promptService.confirm(`Add entities?`, true))
  //     ? await this.buildEntityList()
  //     : [];
  //   const groups = (await this.promptService.confirm(`Add groups?`, true))
  //     ? await this.groupBuilder()
  //     : [];
  //   return await this.fetchService.fetch({
  //     body: {
  //       entities,
  //       friendlyName,
  //       groups,
  //     } as PersonDTO,
  //     method: 'post',
  //     url: `/person`,
  //   });
  // }

  public async exec(): Promise<void> {
    const persons = await this.list();
    const person = await this.promptService.menu<PersonDTO | string>({
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry(
        persons
          .map(
            person => [person.friendlyName, person] as PromptEntry<PersonDTO>,
          )
          .sort((a, b) => (a[LABEL] > b[LABEL] ? UP : DOWN)),
      ),
      rightHeader: `Pick person`,
      value: this.lastPerson
        ? persons.find(({ _id }) => _id === this.lastPerson)
        : undefined,
    });
    if (IsDone(person)) {
      return;
    }
    // if (person === 'create') {
    //   person = await this.create();
    // }
    if (is.string(person)) {
      throw new NotImplementedException();
    }
    await this.cache.set(CACHE_KEY, person._id);
    this.lastPerson = person._id;
    return await this.processPerson(person);
  }

  public async get(id: string): Promise<PersonDTO> {
    return await this.fetchService.fetch({
      url: `/person/${id}`,
    });
  }

  public async list(): Promise<PersonDTO[]> {
    return await this.fetchService.fetch({
      url: `/person`,
    });
  }

  public async pickOne(current?: PersonDTO | string): Promise<PersonDTO> {
    const persons = await this.list();
    current = is.string(current)
      ? persons.find(({ _id }) => _id === current)
      : current;
    const person = await this.promptService.pickOne<PersonDTO | string>(
      `Pick a person`,
      ToMenuEntry([
        // [`${ICONS.CREATE}Create new`, `create`],
        ...this.promptService.conditionalEntries(
          !is.empty(persons),
          persons.map(person => [person.friendlyName, person]),
        ),
      ]),
      current,
    );
    // if (person === `create`) {
    //   return await this.create();
    // }
    if (is.string(person)) {
      throw new NotImplementedException();
    }
    return person;
  }

  public async processPerson(
    person: PersonDTO,
    defaultAction?: string,
  ): Promise<void> {
    this.applicationManager.setHeader(person.friendlyName);
    const groups = is.empty(person.groups)
      ? []
      : await this.groupCommand.list({
          filters: new Set([
            {
              field: '_id',
              operation: FILTER_OPERATIONS.in,
              value: person.groups.join(','),
            },
          ]),
        });

    const rooms = is.empty(person.rooms)
      ? []
      : await this.groupCommand.list({
          filters: new Set([
            {
              field: '_id',
              operation: FILTER_OPERATIONS.in,
              value: person.groups.join(','),
            },
          ]),
        });

    person.save_states ??= [];
    const action = await this.promptService.menu<tRoom | tGroup | tEntity>({
      keyMap: {
        d: MENU_ITEMS.DONE,
        e: MENU_ITEMS.ENTITIES,
        g: MENU_ITEMS.GROUPS,
        p: [
          this.pinnedItems.isPinned('person', person._id) ? 'Unpin' : 'pin',
          'pin',
        ],
        r: MENU_ITEMS.RENAME,
        x: MENU_ITEMS.DELETE,
      },
      left: [
        ...(is.empty(person.entities)
          ? []
          : (person.entities.map(({ entity_id }) => {
              return { entry: [entity_id, { entity_id }], type: 'Entity' };
            }) as MainMenuEntry<tEntity>[])),
        ...(is.empty(groups)
          ? []
          : (groups.map(group => {
              return { entry: [group.friendlyName, { group }], type: 'Group' };
            }) as MainMenuEntry<tGroup>[])),
      ],
      right: [
        { entry: MENU_ITEMS.ENTITIES, type: 'Manage' },
        { entry: MENU_ITEMS.GROUPS, type: 'Manage' },
        ...person.save_states.map(
          state =>
            ({
              entry: [state.friendlyName, state.id],
              type: 'Save States',
            } as MainMenuEntry<string>),
        ),
      ],
      showHeaders: false,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return;
    }
    if (is.object(action)) {
      if (!is.undefined((action as tGroup).group)) {
        return await this.groupCommand.process((action as tGroup).group);
      }
      return await this.entityService.process((action as tEntity).entity_id);
    }
    switch (action) {
      case 'pin':
        this.pinnedItems.toggle({
          target: person._id,
          type: 'person',
        });
        return await this.processPerson(person, action);
      case 'states':
        person = await this.personState.process(person);
        return await this.processPerson(person, action);
      case 'rename':
        person.friendlyName = await this.promptService.string(
          `New name`,
          person.friendlyName,
        );
        person = await this.update(person);
        return await this.processPerson(person, action);
      case 'entities':
        person.entities = await this.buildEntityList(
          person.entities.map(item => item.entity_id),
        );
        person = await this.update(person);
        return await this.processPerson(person, action);
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${chalk.magenta.bold(
              person.friendlyName,
            )}`,
          ))
        ) {
          return await this.processPerson(person, action);
        }
        await this.fetchService.fetch({
          method: 'delete',
          url: `/person/${person._id}`,
        });
        return;
      case 'groups':
        const added = await this.groupCommand.pickMany([], person.groups);
        person.groups = added.map(({ _id }) => _id);
        person = await this.update(person);
        return await this.processPerson(person, action);
      default:
        await this.personState.activate(person, action);
        return await this.processPerson(person, action);
    }
  }

  public async update(body: PersonDTO): Promise<PersonDTO> {
    return await this.fetchService.fetch({
      body,
      method: 'put',
      url: `/person/${body._id}`,
    });
  }

  protected async onModuleInit(): Promise<void> {
    this.lastPerson = await this.cache.get(CACHE_KEY);
    this.pinnedItems.loaders.set('person', async ({ target }) => {
      const person = await this.get(target);
      await this.processPerson(person);
    });
  }

  private async buildEntityList(
    current: string[] = [],
  ): Promise<RoomEntityDTO[]> {
    const ids = await this.entityService.buildList(
      [
        HASS_DOMAINS.climate,
        HASS_DOMAINS.fan,
        HASS_DOMAINS.light,
        HASS_DOMAINS.lock,
        HASS_DOMAINS.media_player,
        HASS_DOMAINS.sensor,
        HASS_DOMAINS.switch,
      ],
      { current },
    );
    return ids.map(entity_id => ({
      entity_id,
    }));
  }

  private async groupBuilder(current: string[] = []): Promise<string[]> {
    const action = await this.promptService.pickOne(
      `Group actions`,
      ToMenuEntry([
        [`${ICONS.GROUPS}Use existing`, 'existing'],
        [`Done`, 'done'],
      ]),
      `person groups`,
    );
    switch (action) {
      // Eject!
      case 'done':
        return current;
      //
      case 'existing':
        const groups = await this.groupCommand.list();
        const selection = await this.promptService.pickMany(
          `Groups to attach`,
          groups
            .filter(({ _id }) => !current.includes(_id))
            .map(group => [group.friendlyName, group]),
        );
        if (is.empty(selection)) {
          this.logger.warn(`No groups selected`);
        } else {
          current.push(...selection.map(item => item._id));
        }
        return current;
    }
    this.logger.error({ action }, `Not implemented`);
    return current;
  }

  private async removeEntities(person: PersonDTO): Promise<PersonDTO> {
    const entities = await this.promptService.pickMany(
      `Keep selected`,
      person.entities
        .map(({ entity_id }) => [entity_id, entity_id])
        .sort(([a], [b]) => (a > b ? UP : DOWN)) as PromptEntry[],
      { default: person.entities.map(({ entity_id }) => entity_id) },
    );
    return await this.update({
      ...person,
      entities: person.entities.filter(item =>
        entities.includes(item.entity_id),
      ),
    });
  }
}
