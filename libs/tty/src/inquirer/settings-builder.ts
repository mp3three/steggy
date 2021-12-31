import { INestApplication } from '@nestjs/common';
import { START } from '@text-based/utilities';
import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import { Question } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';

import { ObjectBuilderOptions } from '../contracts';
import { TableService, TextRenderingService } from '../services';

type tCallback = (value?: unknown) => void;

export class ObjectBuilderPrompt extends Base<Question & ObjectBuilderOptions> {
  private static app: INestApplication;

  public static onPreInit(app: INestApplication): void {
    this.app = app;
  }
  constructor(questions, rl, answers) {
    super(questions, rl, answers);
    this.textRender = ObjectBuilderPrompt.app.get(TextRenderingService);
    this.tableService = ObjectBuilderPrompt.app.get(TableService);
  }

  private done: tCallback;
  private rows: Record<string, unknown>[];
  private tableService: TableService;
  private textRender: TextRenderingService;

  public _run(callback: tCallback): this {
    this.done = callback;
    const events = observe(this.rl);
    events.keypress.forEach(this.onKeypress.bind(this));
    events.line.forEach(this.onKeypress.bind(this));

    cliCursor.hide();
    this.render();
    return this;
  }

  private onEnd(): void {
    this.status = 'answered';
    this.render();
    this.screen.done();
    cliCursor.show();
    this.done();
  }

  private onKeypress(): void {
    this.onEnd();
  }

  private render(): void {
    if (this.status === 'answered') {
      this.screen.render(chalk``, '');
      return;
    }
    this.screen.render(
      this.tableService.renderTable(this.opt, START, START),
      '',
    );
  }
}
