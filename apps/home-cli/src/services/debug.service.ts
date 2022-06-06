import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { ACTIVE_APPLICATION, WorkspaceService } from '@steggy/boilerplate';
import { HassNotificationDTO } from '@steggy/home-assistant-shared';
import {
  ApplicationManagerService,
  IsDone,
  PromptService,
  ScreenService,
  ToMenuEntry,
} from '@steggy/tty';
import { is } from '@steggy/utilities';
import { dump } from 'js-yaml';

import { MENU_ITEMS } from '../includes';
import { HomeFetchService } from './home-fetch.service';

// @Repl({
//   category: `Misc`,
//   icon: ICONS.DEBUG,
//   keyOnly: true,
//   keybind: 'f12',
//   name: `Debugger`,
// })
@Injectable()
export class DebugService {
  constructor(
    @Inject(ACTIVE_APPLICATION) private readonly activeApplication: symbol,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly screenService: ScreenService,
    private readonly workspace: WorkspaceService,
    private readonly applicationManager: ApplicationManagerService,
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
    this.applicationManager.setHeader('Debugger');
    const action = await this.promptService.menu({
      hideSearch: true,
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry([
        [`Controller version`, 'version'],
        [`Light Manager Cache`, 'lightManagerCache'],
        [`Home Assistant Config`, 'hassConfig'],
        // [`Render template`, 'renderTemplate'],
        // [`Send template notification`, 'sendNotification'],
        [`Persistent notifications`, 'notifications'],
      ]),
      value: defaultAction,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'version':
        const version = await this.fetchService.fetch({ url: `/version` });
        this.screenService.print(`\n\n` + dump(version));
        await this.promptService.acknowledge();
        return await this.exec(action);
      case 'notifications':
        await this.persistentNotifications();
        return await this.exec(action);
      // case 'renderTemplate':
      //   await this.renderTemplate();
      //   return await this.exec(action);
      case 'hassConfig':
        const result = await this.fetchService.fetch({
          url: `/debug/hass-config`,
        });
        this.screenService.print(dump(result));
        await this.promptService.acknowledge();
        return await this.exec(action);
      case 'lightManagerCache':
        await this.lightManagerCache();
        return await this.exec(action);
      // case 'sendNotification':
      //   await this.sendNotification();
      //   return await this.exec(action);
    }
  }

  private async lightManagerCache(): Promise<void> {
    const lights = await this.fetchService.fetch<string[]>({
      url: `/debug/active-lights`,
    });
    console.log(lights);
  }

  private async persistentNotifications(): Promise<void> {
    const notifications = await this.fetchService.fetch<HassNotificationDTO[]>({
      url: `/debug/notifications`,
    });
    if (is.empty(notifications)) {
      return;
    }
    const item = await this.promptService.menu<HassNotificationDTO>({
      keyMap: { d: MENU_ITEMS.DONE },
      right: notifications.map(i => ({ entry: [i.title, i] })),
    });
    if (IsDone(item)) {
      return;
    }
    if (is.string(item)) {
      throw new NotImplementedException();
    }
    await this.fetchService.fetch({
      method: `delete`,
      url: `/debug/notification/${item.notification_id}`,
    });
  }

  // private async renderTemplate(): Promise<void> {
  //   this.LAST_TEMPLATE = await this.promptService.editor(
  //     `Enter template string`,
  //     this.LAST_TEMPLATE,
  //   );
  //   const rendered: Response = (await this.fetchService.fetch({
  //     body: { template: this.LAST_TEMPLATE },
  //     method: 'post',
  //     process: false,
  //     url: `/debug/render-template`,
  //   })) as Response;
  //   const text = await rendered.text();
  //   this.screenService.print(text);
  // }

  // private async sendNotification(): Promise<void> {
  //   const template = await this.promptService.editor(`Enter template string`);
  //   await this.fetchService.fetch({
  //     body: { template },
  //     method: 'post',
  //     url: `/debug/send-notification`,
  //   });
  // }
}
