import {
  ConfigBuilderService,
  DONE,
  ICONS,
  PromptService,
  Repl,
} from '@ccontour/tty';
import { dump } from 'js-yaml';
import { Response } from 'node-fetch';

import { HomeFetchService } from './home-fetch.service';

@Repl({
  category: `Misc`,
  icon: ICONS.DEBUG,
  name: `Debugger`,
})
export class DebugService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly configBuilder: ConfigBuilderService,
  ) {}

  /**
   * Copy/paste from Home Assistant
   */
  private LAST_TEMPLATE = `{## Imitate available variables: ##}
{% set my_test_json = {
  "temperature": 77,
  "unit": "°F"
} %}

The temperature is {{ my_test_json.temperature }} {{ my_test_json.unit }}.

{% if is_state("sun.sun", "above_horizon") -%}
  The sun rose {{ relative_time(states.sun.sun.last_changed) }} ago.
{%- else -%}
  The sun will rise at {{ as_timestamp(state_attr("sun.sun", "next_rising")) | timestamp_local }}.
{%- endif %}

For loop example getting entity values in the weather domain:

{% for state in states.weather -%}
  {%- if loop.first %}The {% elif loop.last %} and the {% else %}, the {% endif -%}
  {{ state.name | lower }} is {{state.state_with_unit}}
{%- endfor %}.`;

  public async exec(defaultAction?: string): Promise<void> {
    const action = await this.promptService.menuSelect(
      [
        [`Manage configuration`, 'configure'],
        [`Controller version`, 'version'],
        [`Light Manager Cache`, 'lightManagerCache'],
        [`Home Assistant Config`, 'hassConfig'],
        [`Render template`, 'renderTemplate'],
        [`Send template notification`, 'sendNotification'],
        [`Restart Home Assistant`, 'reboot'],
      ],
      'Debug action',
      defaultAction,
    );

    switch (action) {
      case DONE:
        return;
      case 'reboot':
        await this.fetchService.fetch({
          method: 'post',
          url: `/admin/hass-reboot`,
        });
        return await this.exec(action);
      case 'version':
        const version = await this.fetchService.fetch({ url: `/version` });
        this.promptService.print(dump(version));
        return await this.exec(action);
      case 'configure':
        await this.configBuilder.handleConfig();
        return await this.exec(action);
      case 'renderTemplate':
        await this.renderTemplate();
        return await this.exec(action);
      case 'hassConfig':
        const result = await this.fetchService.fetch({
          url: `/debug/hass-config`,
        });
        this.promptService.print(dump(result));
        return await this.exec(action);
      case 'lightManagerCache':
        await this.lightManagerCache();
        return await this.exec(action);
      case 'sendNotification':
        await this.sendNotification();
        return await this.exec(action);
    }
  }

  private async lightManagerCache(): Promise<void> {
    const lights = await this.fetchService.fetch<string[]>({
      url: `/debug/active-lights`,
    });
    console.log(lights);
  }

  private async renderTemplate(): Promise<void> {
    this.LAST_TEMPLATE = await this.promptService.editor(
      `Enter template string`,
      this.LAST_TEMPLATE,
    );
    const rendered: Response = (await this.fetchService.fetch({
      body: {
        template: this.LAST_TEMPLATE,
      },
      method: 'post',
      process: false,
      url: `/debug/render-template`,
    })) as Response;
    const text = await rendered.text();
    this.promptService.print(text);
  }

  private async sendNotification(): Promise<void> {
    const template = await this.promptService.editor(`Enter template string`);
    await this.fetchService.fetch({
      body: { template },
      method: 'post',
      url: `/debug/send-notification`,
    });
  }
}
