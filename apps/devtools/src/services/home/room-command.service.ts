import {
  RoomCommandDTO,
  RoomCommandScope,
} from '@automagical/controller-logic';
import { FanSpeeds } from '@automagical/home-assistant';
import { PromptService, Repl, REPL_TYPE } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import inquirer from 'inquirer';

import { GroupCommandService } from './group-command.service';
import { HomeFetchService } from './home-fetch.service';

type extra = { scope: RoomCommandScope[]; path?: string };

@Repl({
  description: [`Commands scoped to a single room`],
  name: '🛌 Rooms',
  type: REPL_TYPE.home,
})
export class RoomCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly groupCommand: GroupCommandService,
  ) {}

  public async exec(): Promise<void> {
    const { primary, secondary } = await this.fetchService.listRooms();

    const room = await this.promptService.pickOne('Which room(s)?', [
      new inquirer.Separator('Primary'),
      ...primary,
      new inquirer.Separator('Secondary'),
      ...secondary,
    ]);

    const actions = [
      new inquirer.Separator('Commands'),
      { name: 'Area On', value: 'areaOn' },
      { name: 'Area Off', value: 'areaOff' },
      { name: 'Auto', value: 'favorite' },
    ];
    if (room.fan) {
      actions.push({ name: 'Set Fan', value: 'fan' });
    }
    if (room.media) {
      actions.push({ name: 'Media', value: 'media' });
    }

    const action = await this.promptService.pickOne('Action', [
      ...actions,
      new inquirer.Separator('Information'),
      { name: 'Group Info', value: 'groups' },
      new inquirer.Separator(),
      { name: 'Cancel', value: 'cancel' },
    ]);
    switch (action) {
      case 'cancel':
        return;
      case 'groups':
        await this.groupCommand.exec(room.name);
        return;
    }
    const extra = await this.getExtra(action);
    if (extra === false) {
      return;
    }
    const { scope, path } = extra;

    const url = `/room/${room.name}/${action}${path ?? ''}`;
    const response = await this.fetchService.fetch({
      body: JSON.stringify({
        scope,
      } as RoomCommandDTO),
      method: 'put',
      url,
    });
    this.logger.debug({ response });
  }

  private async getExtra(action: string): Promise<extra | false> {
    const out: extra = {
      scope: [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
    };
    switch (action) {
      case 'fan':
        const speed = await this.promptService.pickOne(
          'Fan speed',
          Object.keys(FanSpeeds)
            .reverse()
            .map((key) => {
              return {
                name:
                  key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
                value: key,
              };
            }),
        );
        out.path = `/${speed}`;
        return out;
      case 'media':
        const target = await this.promptService.pickOne('Action', [
          { name: 'Turn On', value: 'turnOn' },
          { name: 'Turn Off', value: 'turnOff' },
          { name: 'Play / Pause', value: 'playPause' },
          { name: 'Mute', value: 'mute' },
          new inquirer.Separator(),
          { name: 'Cancel', value: 'cancel' },
        ]);
        if (target === 'cancel') {
          return false;
        }
        out.path = `/${target}`;
        return out;
    }
    return out;
  }
}
