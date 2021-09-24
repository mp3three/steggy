import {
  RoomControllerFlags,
  RoomControllerSettingsDTO,
  RoomInspectResponseDTO,
} from '@automagical/controller-logic';
import { domain, HassStateDTO } from '@automagical/home-assistant';
import { iRepl, PromptService, Repl } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import chalk from 'chalk';

import { HomeFetchService } from './home-fetch.service';

// TODO: Find an inspector gadget joke for this file
// There's gotta be one

@Repl({
  name: '🔍 Inspect',
})
export class InspectService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(): Promise<void> {
    const metadata = await this.pickRoom();

    const { states, groups } =
      await this.fetchService.fetch<RoomInspectResponseDTO>({
        url: `/room/${metadata.name}/inspect`,
      });

    const entity = await this.promptService.pickOne(
      'Entity',
      states.map((entity) => {
        let name = entity.attributes.friendly_name;
        if (name) {
          name = chalk`{bold ${domain(entity.entity_id)}} ${name}`;
        }
        Object.keys(groups).forEach((groupName) => {
          if (groups[groupName].includes(entity.entity_id)) {
            name = chalk`{bold.cyan ${groupName}} ${name}`;
          }
        });
        return {
          name: name || entity.entity_id,
          value: entity,
        };
      }),
    );

    await this.process(entity);
  }

  private async process(entity: HassStateDTO): Promise<void> {
    const action = await this.promptService.expand(`Action`, [
      {
        key: 'p',
        name: 'Print',
        value: 'print',
      },
      {
        key: 'n',
        name: 'Update Name',
        value: 'name',
      },
      {
        key: 'x',
        name: 'Exit',
        value: 'exit',
      },
    ]);

    switch (action) {
      case 'exit':
        return;
      case 'print':
        console.log(JSON.stringify(entity, undefined, '  '));
        return await this.process(entity);
      case 'name':
        const name = await this.promptService.string(`New name`);
        await this.fetchService.fetch({
          body: { name },
          method: 'put',
          url: `/entity/rename/${entity.entity_id}`,
        });
        return await this.process(entity);
    }
  }

  private async pickRoom(): Promise<RoomControllerSettingsDTO> {
    const rooms = await this.fetchService.fetch<RoomControllerSettingsDTO[]>({
      url: `/room/list`,
    });
    if (rooms.length === 0) {
      return undefined;
    }
    const primary: Record<'name' | 'value', string>[] = [];
    rooms.forEach((room) => {
      const entry = {
        name: room.friendlyName,
        value: room.name,
      };
      if (!room.flags.includes(RoomControllerFlags.SECONDARY)) {
        primary.push(entry);
      }
    });

    const selection = await this.promptService.pickOne(
      'Which room(s)?',
      this.sort(primary),
    );

    return rooms.find((i) => selection === i.name);
  }

  private sort(
    items: Record<'name' | 'value', string>[],
  ): Record<'name' | 'value', string>[] {
    return items.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      }
      return -1;
    });
  }
}
