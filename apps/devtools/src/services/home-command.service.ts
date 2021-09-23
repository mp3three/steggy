import {
  RoomCommandDTO,
  RoomCommandScope,
  RoomControllerSettingsDTO,
} from '@automagical/controller-logic';
import { iRepl, PromptService, Repl } from '@automagical/tty';
import {
  AutoLogService,
  FetchService,
  InjectConfig,
  sleep,
  Trace,
} from '@automagical/utilities';
import { each } from 'async';
import inquirer from 'inquirer';

import { CONTROLLER_API } from '../config';

@Repl({
  name: 'Home Command',
})
export class HomeCommandService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: FetchService,
    private readonly promptService: PromptService,
    @InjectConfig(CONTROLLER_API) readonly homeController: string,
  ) {
    fetchService.BASE_URL = homeController;
  }

  @Trace()
  // @Timeout
  public async exec(): Promise<void> {
    const rooms = await this.pickRoom();
    if (!rooms) {
      this.logger.error(`Received empty room list`);
      await sleep(5000);
      return;
    }
    // this.logger.info({ rooms });

    const action = await this.promptService.pickOne('Action', [
      'favorite',
      'areaOff',
      'areaOn',
    ]);

    this.logger.debug({ action, rooms: rooms.map((i) => i.name) });
    await each(rooms, async (item, callback) => {
      const response = await this.fetchService.fetch({
        body: JSON.stringify({
          scope: [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
        } as RoomCommandDTO),
        method: 'put',
        url: `/room/${item.name}/${action}`,
      });
      this.logger.debug({ response });
      callback();
    });
  }

  private async pickRoom(): Promise<RoomControllerSettingsDTO[]> {
    const rooms = await this.fetchService.fetch<RoomControllerSettingsDTO[]>({
      url: `/room/list`,
    });
    if (rooms.length === 0) {
      return undefined;
    }
    const selection = await this.promptService.pickMany(
      'Which rooms?',
      rooms.map((room) => {
        return {
          name: room.friendlyName,
          value: room.name,
        };
      }),
      { min: 1 },
    );

    return rooms.filter((i) => selection.includes(i.name));
  }
}
