import {
  BLESSED_GRID,
  GridElement,
  Markdown,
  MarkdownElement,
  MarkdownOptions,
} from '@automagical/terminal';
import { RefreshAfter } from '@automagical/terminal';
import { CronExpression, MQTT_HEALTH_CHECK } from '@automagical/utilities';
import { Cron, OnMQTT } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';

@Injectable()
export class HealthService {
  private SERVICES = new Map<string, dayjs.Dayjs>();
  private WIDGET: MarkdownElement;

  constructor(
    @Inject(BLESSED_GRID)
    private readonly GRID: GridElement,
  ) {}

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

  @OnMQTT(MQTT_HEALTH_CHECK, { omitIncoming: true })
  protected onHealthCheck(app: string): void {
    this.SERVICES.set(app, dayjs());
    this.updateTable();
  }

  @RefreshAfter()
  protected onApplicationBootstrap(): void {
    this.WIDGET = this.GRID.set<MarkdownOptions, MarkdownElement>(
      10,
      10,
      2,
      2,
      Markdown,
      {
        draggable: true,
        label: 'System Health',
        markdown: `# Waiting....`,
        padding: 1,
      } as MarkdownOptions,
    );
  }
}
