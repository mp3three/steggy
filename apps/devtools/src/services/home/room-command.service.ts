import {
  ROOM_ENTITY_TYPES,
  RoomDTO,
  RoomEntityDTO,
} from '@automagical/controller-logic';
import { domain, HASS_DOMAINS } from '@automagical/home-assistant';
import {
  CANCEL,
  MDIIcons,
  PromptService,
  Repl,
  REPL_TYPE,
} from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { encode } from 'ini';

import { EntityService } from './entity.service';
import { GroupCommandService } from './groups/group-command.service';
import { HomeFetchService } from './home-fetch.service';

const EMPTY = 0;

@Repl({
  description: [`Commands scoped to a single room`],
  icon: MDIIcons.television_guide,
  name: `Rooms`,
  type: REPL_TYPE.home,
})
export class RoomCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly groupCommand: GroupCommandService,
    private readonly entityService: EntityService,
  ) {}

  public async create(): Promise<RoomDTO> {
    const friendlyName = await this.promptService.string(`Friendly Name`);
    const description = await this.promptService.string(`Description`);
    const entities = await this.buildEntityList();
    let selectedGroups: string[] = [];

    if (await this.promptService.confirm(`Add existing groups?`)) {
      const groups = await this.groupCommand.list();
      const selection = await this.promptService.pickMany(
        `Attach groups to new room`,
        groups.map((group) => ({
          name: group.friendlyName,
          value: group,
        })),
      );
      if (selection.length === EMPTY) {
        this.logger.warn(`No groups selected`);
      } else {
        selectedGroups = selection.map((item) => item._id);
      }
    }

    return await this.fetchService.fetch({
      body: {
        description,
        entities,
        friendlyName,
        selectedGroups,
      } as RoomDTO,
      method: 'post',
      url: `/room`,
    });
  }

  public async exec(): Promise<void> {
    const rooms = await this.fetchService.fetch<RoomDTO[]>({
      url: `/room`,
    });
    const room = await this.promptService.pickOne<RoomDTO | string>(
      'Which room?',
      [
        {
          name: 'Create',
          value: 'create',
        },
        ...rooms.map((room) => {
          return {
            name: room.friendlyName,
            value: room,
          };
        }),
      ],
    );
    if (room === CANCEL) {
      return;
    }
    if (room === 'create') {
      await this.create();
      return;
    }
    if (typeof room === 'string') {
      this.logger.error({ room }, `Not implemented condition`);
      return;
    }
    return await this.processRoom(room);
  }

  private async buildEntityList(omit: string[] = []): Promise<RoomEntityDTO[]> {
    const ids = await this.entityService.buildList(
      [
        HASS_DOMAINS.light,
        HASS_DOMAINS.switch,
        HASS_DOMAINS.media_player,
        HASS_DOMAINS.fan,
      ],
      omit,
    );
    const primary = await this.promptService.pickMany(
      `Primary devices`,
      ids.filter((id) =>
        [HASS_DOMAINS.light, HASS_DOMAINS.switch].includes(domain(id)),
      ),
    );

    return ids.map((entity_id) => ({
      entity_id,
      type: primary.includes(entity_id)
        ? ROOM_ENTITY_TYPES.normal
        : ROOM_ENTITY_TYPES.accessory,
    }));
  }

  private async processRoom(room: RoomDTO): Promise<void> {
    const action = await this.promptService.menuSelect([
      {
        name: 'Delete',
        value: 'delete',
      },
      {
        name: 'Describe',
        value: 'describe',
      },
      {
        name: 'Entities',
        value: 'entities',
      },
      {
        name: 'Groups',
        value: 'groups',
      },
    ]);
    switch (action) {
      case CANCEL:
        return;
      case 'describe':
        console.log(encode(room));
        return await this.processRoom(room);
      case 'entities':
        await this.roomEntities(room);
        return await this.processRoom(room);
      case 'groups':
        await this.roomGroups(room);
        return await this.processRoom(room);
    }
  }

  private async roomEntities(room: RoomDTO): Promise<void> {
    room.entities ??= [];
    const actions = [
      {
        name: 'Add',
        value: 'add',
      },
    ];
    if (room.entities.length === EMPTY) {
      this.logger.warn(`No current entities in room`);
    } else {
      actions.unshift({
        name: 'Manipulate',
        value: 'manipulate',
      });
      actions.push({
        name: 'Remove',
        value: 'remove',
      });
    }
    const action = await this.promptService.menuSelect(actions);
    if (action === CANCEL) {
      return;
    }
    switch (action) {
      // Add entities to room
      case 'add':
        const entityAppend = await this.buildEntityList(
          room.entities.map((item) => item.entity_id),
        );
        if (entityAppend.length === EMPTY) {
          this.logger.debug(`Nothing to add`);
          return;
        }
        room.entities.push(...entityAppend);
        await this.update(room);
        return;
      // Remove entities from room
      case 'remove':
        const removeList = await this.promptService.pickMany(
          `Which entities should be removed?`,
          room.entities.map((item) => ({
            name: `${item.entity_id} ${item.type}`,
            value: item.entity_id,
          })),
        );
        await this.update({
          ...room,
          entities: room.entities.filter(
            (item) => !removeList.includes(item.entity_id),
          ),
        });
        return;
      case 'manipulate':
        await this.entityService.processId(
          room.entities.map(({ entity_id }) => entity_id),
        );
        return;
    }
  }

  private async roomGroups(room: RoomDTO): Promise<void> {
    room.groups ??= [];
    const actions = [
      {
        name: 'Add',
        value: 'add',
      },
    ];
    if (room.groups.length === EMPTY) {
      this.logger.warn(`No current entities in room`);
    } else {
      actions.unshift({
        name: 'Manipulate',
        value: 'manipulate',
      });
      actions.push({
        name: 'Remove',
        value: 'remove',
      });
    }
    const action = await this.promptService.menuSelect(actions);
    if (action === CANCEL) {
      return;
    }
  }

  private async update(body: RoomDTO): Promise<RoomDTO> {
    return await this.fetchService.fetch({
      body,
      method: 'put',
      url: `/room/${body._id}`,
    });
  }
}
