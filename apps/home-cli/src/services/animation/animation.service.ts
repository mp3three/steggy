import { FlashAnimationDTO } from '@automagical/controller-shared';
import { HASS_DOMAINS } from '@automagical/home-assistant-shared';
import {
  ColorsService,
  DONE,
  ICONS,
  IsDone,
  PromptService,
  Repl,
  ToMenuEntry,
} from '@automagical/tty';
import chalk from 'chalk';

import { EntityService } from '../home-assistant/entity.service';
import { HomeFetchService } from '../home-fetch.service';

const DEFAULT_DURATION = 10;
const SECOND = 1000;
const DEFAULT_INTERVAL = 250;

@Repl({
  category: 'Misc',
  icon: ICONS.ANIMATION,
  keyOnly: true,
  keybind: 'f9',
  name: 'Misc',
})
export class AnimationService {
  constructor(
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly entityService: EntityService,
    private readonly colorService: ColorsService,
  ) {}

  public async exec(defaultAction?: string): Promise<void> {
    const action = await this.promptService.menu({
      keyMap: { d: [chalk.bold`Done`, DONE] },
      right: ToMenuEntry([[`Flash`, 'flash']]),
      showHeaders: false,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return;
    }
    if (action === 'flash') {
      await this.flash();
      return await this.exec(action);
    }
  }

  public async flash(): Promise<void> {
    const entity_id = await this.entityService.pickInDomain([
      HASS_DOMAINS.light,
    ]);
    const duration =
      (await this.promptService.number(
        `Duration (seconds)`,
        DEFAULT_DURATION,
      )) * SECOND;
    const interval = await this.promptService.number(
      `Interval (ms)`,
      DEFAULT_INTERVAL,
    );
    // const brightness = await this.promptService.number(`Brightness (0-255)`);
    const animation: FlashAnimationDTO = {
      duration,
      entity_id,
      interval,
      rgb_color: {
        b: 0,
        g: 0,
        r: 255,
      },
    };
    await this.fetchService.fetch({
      body: animation,
      method: 'post',
      url: `/animation/flash`,
    });
  }
}
