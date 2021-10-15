import {
  CONCURRENT_CHANGES,
  GROUP_TYPES,
  GroupDTO,
  KunamiSensor,
  ROOM_ENTITY_TYPES,
  ROOM_SENSOR_TYPE,
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
import {
  AutoLogService,
  InjectConfig,
  IsEmpty,
  LIB_CONTROLLER_LOGIC,
} from '@automagical/utilities';
import { eachLimit } from 'async';
import { encode } from 'ini';
import inquirer from 'inquirer';

import { LightService } from '../domains';
import { EntityService } from '../entity.service';
import { LightGroupCommandService } from '../groups';
import { GroupCommandService } from '../groups/group-command.service';
import { HomeFetchService } from '../home-fetch.service';
import { KunamiBuilderService } from './kunami-builder.service';
import { RoomSensorsService } from './room-sensors.service';
import { RoomStateService } from './room-state.service';

const UP = 1;
const DOWN = -1;
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
    private readonly lightDomain: LightService,
    private readonly lightService: LightGroupCommandService,
    private readonly kunamiBuilder: KunamiBuilderService,
    private readonly roomSensorsService: RoomSensorsService,
    private readonly stateManager: RoomStateService,
    @InjectConfig(CONCURRENT_CHANGES, LIB_CONTROLLER_LOGIC)
    private readonly concurrentChanges: number,
  ) {}

  public async create(): Promise<RoomDTO> {
    const friendlyName = await this.promptService.string(`Friendly Name`);
    const entities = await this.buildEntityList();
    const groups = await this.groupBuilder();

    const body: RoomDTO = {
      entities,
      friendlyName,
      groups,
    };

    return await this.fetchService.fetch({
      body,
      method: 'post',
      url: `/room`,
    });
  }

  public async exec(): Promise<void> {
    const rooms = await this.fetchService.fetch<RoomDTO[]>({
      url: `/room`,
    });
    let room = await this.promptService.menuSelect<RoomDTO | string>([
      ...rooms
        .map((room) => ({
          name: room.friendlyName,
          value: room,
        }))
        .sort((a, b) => (a.name > b.name ? UP : DOWN)),
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

  public async processRoom(
    room: RoomDTO,
    defaultAction?: string,
  ): Promise<void> {
    this.promptService.header(room.friendlyName);
    const action = await this.promptService.menuSelect(
      [
        ...this.promptService.itemsFromEntries([
          ['Turn On', 'turnOn'],
          ['Turn Off', 'turnOff'],
          ['Dim Up', 'dimUp'],
          ['Dim Down', 'dimDown'],
        ]),
        new inquirer.Separator(),
        ...this.promptService.itemsFromEntries([
          ['Delete', 'delete'],
          ['Describe', 'describe'],
          ['Entities', 'entities'],
          ['Groups', 'groups'],
          ['Rename', 'rename'],
          ['Sensor Commands', 'sensorCommands'],
          ['State Manager', 'state'],
        ]),
      ],
      undefined,
      defaultAction,
    );
    switch (action) {
      case 'dimDown':
        await this.dimDown(room);
        return await this.processRoom(room, action);
      case 'dimUp':
        await this.dimUp(room);
        return await this.processRoom(room, action);
      case 'state':
        await this.stateManager.exec(room);
        return await this.processRoom(room, action);
      case 'sensorCommands':
        room = (await this.roomSensorsService.exec(room)) || room;
        return await this.processRoom(room, action);
      case 'rename':
        room.friendlyName = await this.promptService.string(
          `New name`,
          room.friendlyName,
        );
        room = await this.update(room);
        return await this.processRoom(room, action);
      case 'turnOn':
        await this.fetchService.fetch({
          method: 'put',
          url: `/room/${room._id}/turnOn`,
        });
        return await this.processRoom(room, action);
      case 'turnOff':
        await this.fetchService.fetch({
          method: 'put',
          url: `/room/${room._id}/turnOff`,
        });
        return await this.processRoom(room, action);
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
        return await this.processRoom(room, action);
      case 'entities':
        await this.roomEntities(room);
        return await this.processRoom(room, action);
      case 'groups':
        await this.roomGroups(room);
        return await this.processRoom(room, action);
    }
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

  private async dimDown(room: RoomDTO): Promise<void> {
    await eachLimit(
      room.entities.filter((i) => domain(i.entity_id) === HASS_DOMAINS.light),
      this.concurrentChanges,
      async ({ entity_id }, callback) => {
        await this.lightDomain.dimDown(entity_id);
        callback();
      },
    );
    const groups = await this.groupCommand.getMap();
    await eachLimit(
      room.groups.filter(
        (group) => groups.get(group)?.type === GROUP_TYPES.light,
      ),
      this.concurrentChanges,
      async (group, callback) => {
        await this.lightService.dimDown(group);
        callback();
      },
    );
  }

  private async dimUp(room: RoomDTO): Promise<void> {
    await eachLimit(
      room.entities.filter((i) => domain(i.entity_id) === HASS_DOMAINS.light),
      this.concurrentChanges,
      async ({ entity_id }, callback) => {
        await this.lightDomain.dimUp(entity_id);
        callback();
      },
    );
    const groups = await this.groupCommand.getMap();
    await eachLimit(
      room.groups.filter(
        (group) => groups.get(group)?.type === GROUP_TYPES.light,
      ),
      this.concurrentChanges,
      async (group, callback) => {
        await this.lightService.dimDown(group);
        callback();
      },
    );
  }

  private async groupBuilder(current: string[] = []): Promise<string[]> {
    const action = await this.promptService.pickOne(
      `Group actions`,
      this.promptService.itemsFromEntries([
        ['Create new', 'create'],
        ['Use existing', 'existing'],
        ['Done', 'done'],
      ]),
    );
    switch (action) {
      //
      case 'create':
        // pointless destructuring ftw
        const { _id } = await this.groupCommand.create();
        current.push(_id);
        return await this.groupBuilder(current);
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
            .map((group) => ({
              name: group.friendlyName,
              value: group,
            })),
        );
        if (IsEmpty(selection)) {
          this.logger.warn(`No groups selected`);
        } else {
          current.push(...selection.map((item) => item._id));
        }
        return await this.groupBuilder(current);
    }
    this.logger.error({ action }, `Not implemented`);
    return current;
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
    if (IsEmpty(room.groups)) {
      this.logger.warn(`No current groups in room`);
    }
    const allGroups = await this.groupCommand.list();
    const action = await this.promptService.menuSelect<GroupDTO | string>([
      {
        name: 'Add',
        value: 'add',
      },
      ...(IsEmpty(room.groups)
        ? []
        : [
            {
              name: 'Remove',
              value: 'remove',
            },
            new inquirer.Separator(),
            ...allGroups
              .filter(({ _id }) => room.groups.includes(_id))
              .map((group) => ({ name: group.friendlyName, value: group })),
          ]),
    ]);
    switch (action) {
      case CANCEL:
        return;
      case 'add':
        let addMore = true;
        room.groups ??= [];
        do {
          const group = await this.groupCommand.pickOne(room.groups);
          room.groups.push(group._id);
          addMore = await this.promptService.confirm(`Add another?`);
        } while (addMore === true);
        await this.update(room);
        return;
    }
    if (typeof action === 'string') {
      this.logger.error({ action }, `Not implemented`);
      return;
    }
    await this.groupCommand.process(action, allGroups);
  }

  private async update(body: RoomDTO): Promise<RoomDTO> {
    return await this.fetchService.fetch({
      body,
      method: 'put',
      url: `/room/${body._id}`,
    });
  }
}
