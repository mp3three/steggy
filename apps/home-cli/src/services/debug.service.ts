import { DONE, PromptService, Repl } from '@automagical/tty';
import { dump } from 'js-yaml';
import { Response } from 'node-fetch';

import { ICONS } from '../typings';
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
  ) {}

  private LAST_TEMPLATE = '';

  public async exec(defaultAction?: string): Promise<void> {
    const action = await this.promptService.menuSelect(
      [
        [`Light Manager Cache`, 'lightManagerCache'],
        [`Home Assistant Config`, 'hassConfig'],
        [`Render template`, 'renderTemplate'],
      ],
      undefined,
      defaultAction,
    );

    switch (action) {
      case DONE:
        return;
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

    console.log(await rendered.text());
  }
}
