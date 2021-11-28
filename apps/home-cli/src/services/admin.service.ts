import { ICONS, PromptService, Repl } from '@ccontour/tty';

import { HomeFetchService } from './home-fetch.service';

@Repl({
  category: 'Misc',
  icon: ICONS.ADMIN,
  name: `Home Assistant Admin`,
})
export class AdminService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(defaultAction: string): Promise<void> {
    const action = await this.promptService.menuSelect(
      [
        [`Restart`, 'restart'],
        ['Stop', 'stop'],
        ['Location & Customizations', 'location'],
        ['Automations', 'automations'],
        ['Input Booleans', 'input_boolean'],
        ['Input Date Times', 'input_date_time'],
        ['Input Numbers', 'input_numbers'],
        ['Input Selects', 'input_selects'],
        ['Input Texts', 'input_texts'],
        ['Manually Configured MQTT Entities', 'mqtt'],
        ['People', 'people'],
        ['Scenes', 'scenes'],
        ['Scripts', 'scripts'],
        ['Timer', 'timer'],
        ['Zones', 'zones'],
      ],
      `Command`,
      defaultAction,
    );
    await this.fetchService.fetch({
      method: `post`,
      url: `/admin/reload/${action}`,
    });
    await this.exec(action);
  }
}
