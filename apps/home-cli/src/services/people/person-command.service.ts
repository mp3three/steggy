import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
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
  ToMenuEntry,
} from '@steggy/tty';
import { DOWN, FILTER_OPERATIONS, is, LABEL, UP } from '@steggy/utilities';
import chalk from 'chalk';

import { MENU_ITEMS } from '../../includes';
import { ICONS } from '../../types';
import { GroupCommandService } from '../groups';
import { EntityService } from '../home-assistant';
import { HomeFetchService } from '../home-fetch.service';
import { MetadataService } from '../metadata.service';
import { PinnedItemService } from '../pinned-item.service';
import { RoomCommandService } from '../rooms';
import { PersonStateService } from './person-state.service';

const CACHE_KEY = 'MENU_LAST_PERSON';

type tGroup = { group: GroupDTO };
type tRoom = { room: RoomDTO };
type tEntity = { entity_id: string };

@Injectable()
export class PersonCommandService {
  constructor(
    @InjectCache()
    private readonly cache: CacheManagerService,
    @Inject(forwardRef(() => MetadataService))
    private readonly metadataService: MetadataService<PersonDTO>,
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

  // eslint-disable-next-line radar/cognitive-complexity
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
      : await this.roomService.list({
          filters: new Set([
            {
              field: '_id',
              operation: FILTER_OPERATIONS.in,
              value: person.rooms.join(','),
            },
          ]),
        });

    person.save_states ??= [];
    const action = await this.promptService.menu<tRoom | tGroup | tEntity>({
      keyMap: {
        d: MENU_ITEMS.DONE,
        e: MENU_ITEMS.ENTITIES,
        g: MENU_ITEMS.GROUPS,
        n: MENU_ITEMS.RENAME,
        p: [
          this.pinnedItems.isPinned('person', person._id) ? 'Unpin' : 'pin',
          'pin',
        ],
        r: MENU_ITEMS.ROOMS,
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
        ...(is.empty(rooms)
          ? []
          : (rooms.map(room => {
              return { entry: [room.friendlyName, { room }], type: 'Rooms' };
            }) as MainMenuEntry<tRoom>[])),
      ],
      right: [
        { entry: MENU_ITEMS.ENTITIES, type: 'Manage' },
        { entry: MENU_ITEMS.GROUPS, type: 'Manage' },
        { entry: MENU_ITEMS.ROOMS, type: 'Manage' },
        ...person.save_states.map(
          state =>
            ({
              entry: [`${ICONS.ACTIVATE}${state.friendlyName}`, state.id],
              type: 'Save States',
            } as MainMenuEntry<string>),
        ),
        ...person.metadata.map(
          metadata =>
            ({
              entry: [
                chalk`{gray (${metadata.type})} ${metadata.name}`,
                metadata.id,
              ],
              helpText: chalk`{green.bold Current Value}: ${this.metadataService.formatValue(
                metadata,
              )}${metadata.description ? `\n${metadata.description}` : ''}`,
              type: 'Metadata',
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
          person.entities.map(({ entity_id }) => entity_id),
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
        const addedGroups = await this.groupCommand.pickMany([], person.groups);
        person.groups = addedGroups.map(({ _id }) => _id);
        person = await this.update(person);
        return await this.processPerson(person, action);
      case 'rooms':
        const addedRooms = await this.roomService.pickMany([], person.rooms);
        person.rooms = addedRooms.map(({ _id }) => _id);
        person = await this.update(person);
        return await this.processPerson(person, action);
      default:
        const isMetadata = person.metadata.find(({ id }) => id === action);
        if (isMetadata) {
          person = await this.metadataService.setValue(
            person,
            'person',
            action,
          );
          return await this.processPerson(person, action);
        }
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
}
