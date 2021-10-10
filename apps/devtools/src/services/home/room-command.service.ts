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
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import { encode } from 'ini';
import inquirer from 'inquirer';

import { EntityService } from './entity.service';
import { GroupCommandService } from './groups/group-command.service';
import { HomeFetchService } from './home-fetch.service';

@Repl({
  description: [`Commands scoped to a single room`],
  icon: MDIIcons.television_box,
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
      if (IsEmpty(selection)) {
        this.logger.warn(`No groups selected`);
      } else {
        selectedGroups = selection.map((item) => item._id);
      }
    }

    const room: RoomDTO = {
      entities,
      friendlyName,
      groups: selectedGroups,
    };

    return await this.fetchService.fetch({
      body: room,
      method: 'post',
      url: `/room`,
    });
  }

  public async exec(): Promise<void> {
    const rooms = await this.fetchService.fetch<RoomDTO[]>({
      url: `/room`,
    });
    let room = await this.promptService.menuSelect<RoomDTO | string>([
      ...rooms.map((room) => ({
        name: room.friendlyName,
        value: room,
      })),
      new inquirer.Separator(),
      {
        name: 'Create',
        value: 'create',
      },
    ]);
    if (room === CANCEL) {
      return;
    }
    if (room === 'create') {
      room = await this.create();
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
        name: 'Turn On',
        value: 'turnOn',
      },
      {
        name: 'Turn Off',
        value: 'turnOff',
      },
      new inquirer.Separator(),
      {
        name: 'Entities',
        value: 'entities',
      },
      {
        name: 'Groups',
        value: 'groups',
      },
      {
        name: 'Rename',
        value: 'rename',
      },

      {
        name: 'Delete',
        value: 'delete',
      },
      {
        name: 'Describe',
        value: 'describe',
      },
    ]);
    switch (action) {
      case 'rename':
        room.friendlyName = await this.promptService.string(
          `New name`,
          room.friendlyName,
        );
        room = await this.update(room);
        return await this.processRoom(room);
      case 'turnOn':
        await this.fetchService.fetch({
          method: 'put',
          url: `/room/${room._id}/turnOn`,
        });
        return await this.processRoom(room);
      case 'turnOff':
        await this.fetchService.fetch({
          method: 'put',
          url: `/room/${room._id}/turnOff`,
        });
        return await this.processRoom(room);
      case 'delete':
        await this.fetchService.fetch({
          method: 'delete',
          url: `/room/${room._id}`,
        });
        return;
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
    if (IsEmpty(room.entities)) {
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
        if (IsEmpty(entityAppend)) {
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
    if (IsEmpty(room.groups)) {
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
      case 'add':
        let addMore = true;
        room.groups ??= [];
        do {
          const group = await this.groupCommand.pickOne(room.groups);
          room.groups.push(group._id);
          addMore = await this.promptService.confirm(`Add another?`);
        } while (addMore === true);
        if (!(await this.promptService.confirm('Send changes?'))) {
          return;
        }
        await this.update(room);
        return;
      case 'remove':
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
