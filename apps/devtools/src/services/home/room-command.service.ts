import {
  RoomCommandDTO,
  RoomCommandScope,
  RoomControllerSettingsDTO,
} from '@automagical/controller-logic';
import { CANCEL, PromptService, Repl, REPL_TYPE } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import inquirer from 'inquirer';

import { FanService, MediaService } from './domains';
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
    private readonly fanService: FanService,
    private readonly mediaService: MediaService,
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
        await this.groupCommand.list(room.name);
        return;
      case 'fan':
        await this.fanService.processId(room.fan);
        return;
      case 'media':
        await this.mediaService.processId(room.media);
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
}
