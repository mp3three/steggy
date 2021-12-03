import { HassNotificationDTO } from '@ccontour/home-assistant';
import {
  ConfigBuilderService,
  DONE,
  ICONS,
  PromptService,
  Repl,
} from '@ccontour/tty';
import {
  InjectConfig,
  IsEmpty,
  PackageJsonDTO,
  WorkspaceService,
} from '@ccontour/utilities';
import { ConflictException, NotImplementedException } from '@nestjs/common';
import chalk from 'chalk';
import execa from 'execa';
import { dump } from 'js-yaml';
import { Response } from 'node-fetch';
import semver from 'semver';

import { LATEST_PACKAGE } from '../config';
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
    private readonly workspace: WorkspaceService,
    private readonly configBuilder: ConfigBuilderService,
    @InjectConfig(LATEST_PACKAGE) private readonly latestPackage: string,
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
        [`Persistent notifications`, 'notifications'],
        [`Update checker`, 'update'],
      ],
      'Debug action',
      defaultAction,
    );

    switch (action) {
      case DONE:
        return;
      case 'update':
        await this.updateChecker();
        return await this.exec(action);
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
      case 'notifications':
        await this.persistentNotications();
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

  private async persistentNotications(): Promise<void> {
    const notifications = await this.fetchService.fetch<HassNotificationDTO[]>({
      url: `/debug/notifications`,
    });
    if (IsEmpty(notifications)) {
      return;
    }
    const item = await this.promptService.menuSelect(
      notifications.map((i) => [i.title, i]),
      `Dismiss item`,
    );
    if (item === DONE) {
      return;
    }
    if (typeof item === 'string') {
      throw new NotImplementedException();
    }
    await this.fetchService.fetch({
      method: `delete`,
      url: `/debug/notification/${item.notification_id}`,
    });
  }

  private async renderTemplate(): Promise<void> {
    this.LAST_TEMPLATE = await this.promptService.editor(
      `Enter template string`,
      this.LAST_TEMPLATE,
    );
    const rendered: Response = (await this.fetchService.fetch({
      body: { template: this.LAST_TEMPLATE },
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

  private async updateChecker(): Promise<void> {
    if (!this.latestPackage) {
      throw new ConflictException(`Invalid url to check`);
    }
    const { version, name } = this.workspace.PACKAGES.get('home-cli');
    const gitPackage = await this.fetchService.fetch<PackageJsonDTO>({
      rawUrl: true,
      url: this.latestPackage,
    });
    if (
      gitPackage.version === this.workspace.PACKAGES.get('home-cli').version
    ) {
      console.log(chalk.green.bold`Using latest version`);
      return;
    }
    if (semver.gt(gitPackage.version, version)) {
      console.log(chalk.magenta.bold(`Current version ahead of remote`));
      return;
    }
    this.promptService.clear();
    this.promptService.scriptHeader(`Updates`);
    console.log(
      [
        chalk.bold.cyan`Updates are available!`,
        ``,
        chalk`{bold.white Current version:} ${version}`,
        chalk`{bold.white Remote version:}  ${gitPackage.version}`,
        ``,
        ``,
      ].join(`\n`),
    );
    const action = await this.promptService.menuSelect(
      [
        [chalk`Update using {blue yarn}`, `yarn`],
        [chalk`Update using {red npm}`, `npm`],
      ],
      `Update`,
    );
    if (action === DONE) {
      return;
    }
    if (action === 'npm') {
      throw new NotImplementedException(
        `FIXME: Developer doesn't know the right update command.`,
      );
    }
    const update = execa(`yarn`, [`global`, `upgrade`, name, `--latest`]);
    update.stdout.pipe(process.stdout);
    await update;
    console.log(
      chalk`${ICONS.WARNING}{yellow.bold Restart application to use updated version}\n`,
    );
  }
}
