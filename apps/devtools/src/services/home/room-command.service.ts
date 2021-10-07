import { ROOM_ENTITY_TYPES, RoomDTO } from '@automagical/controller-logic';
import { domain, HASS_DOMAINS } from '@automagical/home-assistant';
import {
  CANCEL,
  MDIIcons,
  PromptService,
  Repl,
  REPL_TYPE,
} from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { NotImplementedException } from '@nestjs/common';

import { FanService, MediaService } from './domains';
import { EntityService } from './entity.service';
import { GroupCommandService } from './groups/group-command.service';
import { HomeFetchService } from './home-fetch.service';

const EMPTY = 0;

@Repl({
  description: [`Commands scoped to a single room`],
  name: `${MDIIcons.television_guide}Rooms`,
  type: REPL_TYPE.home,
})
export class RoomCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly groupCommand: GroupCommandService,
    private readonly fanService: FanService,
    private readonly entityService: EntityService,
    private readonly mediaService: MediaService,
  ) {}

  public async create(): Promise<void> {
    const friendlyName = await this.promptService.string(`Friendly Name`);
    const description = await this.promptService.string(`Description`);
    const ids = await this.entityService.buildList([
      HASS_DOMAINS.light,
      HASS_DOMAINS.switch,
      HASS_DOMAINS.media_player,
      HASS_DOMAINS.fan,
    ]);
    const primary = await this.promptService.pickMany(
      `Primary devices`,
      ids.filter((id) =>
        [HASS_DOMAINS.light, HASS_DOMAINS.switch].includes(domain(id)),
      ),
    );
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
      }
    }
    await this.fetchService.fetch({
      body: {
        description,
        entities: ids.map((item) => ({
          entity_id: item,
          type: primary.includes(item)
            ? ROOM_ENTITY_TYPES.normal
            : ROOM_ENTITY_TYPES.accessory,
        })),
        friendlyName,
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
            name: '',
            value: room,
          };
        }),
      ],
    );

    if (room === CANCEL) {
      return;
    }
    if (room === 'create') {
      return await this.create();
    }
    if (typeof room === 'string') {
      this.logger.error({ room }, `Not implemented condition`);
      return;
    }
    throw new NotImplementedException();
  }
}
