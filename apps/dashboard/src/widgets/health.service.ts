import { MQTT_HEALTH_CHECK } from '@automagical/contracts/utilities';
import { RefreshAfter } from '@automagical/terminal';
import { OnMQTT, Payload } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  markdown as Markdown,
  Widgets as ContribWidgets,
} from 'blessed-contrib';
import chalk from 'chalk';
import dayjs from 'dayjs';

import { BLESSED_GRID } from '../typings';

@Injectable()
export class HealthService {
  // #region Object Properties

  private SERVICES = new Map<string, dayjs.Dayjs>();
  private WIDGET: ContribWidgets.MarkdownElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID)
    private readonly GRID: ContribWidgets.GridElement,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Cron(CronExpression.EVERY_SECOND)
  @RefreshAfter()
  protected updateTable(): void {
    const online = [];
    const offline = [];
    this.SERVICES.forEach((update, appName) => {
      if (update.isBefore(dayjs().subtract(10, 'second'))) {
        offline.push(appName);
        return;
      }
      online.push(appName);
    });
    const md = [];
    if (online.length > 0) {
      md.push(chalk`{green Online}`, ...online.map((i) => `- ${i}`));
    }
    if (offline.length > 0) {
      if (md.length > 0) {
        md.push('');
      }
      md.push(chalk`{red Offline}`, ...offline.map((i) => `- ${i}`));
    }
    this.WIDGET.setMarkdown(md.join(`\n`));
  }

  @OnMQTT(MQTT_HEALTH_CHECK)
  protected onHealthCheck(@Payload() app: string): void {
    this.SERVICES.set(app, dayjs());
    this.updateTable();
  }

  @RefreshAfter()
  protected onApplicationBootstrap(): void {
    this.WIDGET = this.GRID.set<
      ContribWidgets.MarkdownOptions,
      ContribWidgets.MarkdownElement
    >(10, 10, 2, 2, Markdown, {
      draggable: true,
      label: 'System Health',
      markdown: `# Waiting....`,
      padding: 1,
    } as ContribWidgets.MarkdownOptions);
  }

  // #endregion Protected Methods
}
