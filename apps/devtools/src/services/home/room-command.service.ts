import {
  RoomCommandDTO,
  RoomCommandScope,
  RoomControllerSettingsDTO,
} from '@automagical/controller-logic';
import { FanSpeeds } from '@automagical/home-assistant';
import { CANCEL, PromptService, Repl, REPL_TYPE } from '@automagical/tty';
import { AutoLogService, TitleCase } from '@automagical/utilities';
import inquirer from 'inquirer';

import { GroupCommandService } from './group-command.service';
import { HomeFetchService } from './home-fetch.service';

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

    const room = await this.promptService.pickOne('Which room?', [
      new inquirer.Separator('Primary'),
      ...primary,
      new inquirer.Separator('Secondary'),
      ...secondary,
    ]);

    await this.executeRoomCommand(room);
  }

  public async executeRoomCommand(
    room: RoomControllerSettingsDTO,
  ): Promise<void> {
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

    const action = await this.promptService.menuSelect([
      ...actions,
      new inquirer.Separator('Information'),
      { name: 'Group Info', value: 'groups' },
    ]);
    switch (action) {
      case CANCEL:
        return;
      case 'groups':
        await this.groupCommand.exec(room.name);
        return;
      case 'fan':
        await this.fanCommand(room);
        return;
      case 'media':
        await this.mediaCommand(room);
        return;
    }

    const response = await this.fetchService.fetch({
      body: JSON.stringify({
        scope: [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
      } as RoomCommandDTO),
      method: 'put',
      url: `/room/${room.name}/${action}`,
    });
    this.logger.debug({ response });
    await this.executeRoomCommand(room);
  }

  private async fanCommand(room: RoomControllerSettingsDTO): Promise<void> {
    const speed = await this.promptService.menuSelect(
      Object.keys(FanSpeeds)
        .reverse()
        .map((key) => {
          return {
            name: TitleCase(key),
            value: key,
          };
        }),
      'Fan speed',
    );
    if (speed === 'cancel') {
      return await this.executeRoomCommand(room);
    }
    await this.fetchService.fetch({
      body: { scope: [RoomCommandScope.LOCAL] } as RoomCommandDTO,
      method: 'put',
      url: `/room/${room.name}/fan/${speed}`,
    });
    await this.fanCommand(room);
  }

  private async mediaCommand(room: RoomControllerSettingsDTO): Promise<void> {
    const target = await this.promptService.menuSelect([
      { name: 'Turn On', value: 'turnOn' },
      { name: 'Turn Off', value: 'turnOff' },
      { name: 'Play / Pause', value: 'playPause' },
      { name: 'Mute', value: 'mute' },
    ]);
    if (target === CANCEL) {
      return await this.executeRoomCommand(room);
    }
    await this.fetchService.fetch({
      body: JSON.stringify({
        scope: [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
      } as RoomCommandDTO),
      method: 'put',
      url: `/room/${room.name}/media/${target}`,
    });
    await this.mediaCommand(room);
  }
}
