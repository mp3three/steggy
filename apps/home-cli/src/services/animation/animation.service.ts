import { FlashAnimationDTO } from '@ccontour/controller-logic';
import { HASS_DOMAINS } from '@ccontour/home-assistant';
import { ICONS, PromptService, Repl } from '@ccontour/tty';

import { EntityService } from '../entity.service';
import { HomeFetchService } from '../home-fetch.service';

const DEFAULT_DURATION = 30;
const SECOND = 1000;
const DEFAULT_INTERVAL = 250;

@Repl({
  category: 'Misc',
  icon: ICONS.ANIMATION,
  name: 'Animation',
})
export class AnimationService {
  constructor(
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly entityService: EntityService,
  ) {}

  public async exec(defaultAction?: string): Promise<void> {
    const action = await this.promptService.menuSelect(
      [[`Flash`, 'flash']],
      `Pick one`,
      defaultAction,
    );

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
    const brightness = await this.promptService.number(
      `Brightness (0-255)`,
      255,
    );
    const animation: FlashAnimationDTO = {
      brightness,
      duration,
      entity_id,
      interval,
    };
    await this.fetchService.fetch({
      body: animation,
      method: 'post',
      url: `/animation/flash`,
    });
  }
}
