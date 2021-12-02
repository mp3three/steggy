import { DOWN, UP } from '@ccontour/utilities';
import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import { Question, Separator } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';
import Paginator from 'inquirer/lib/utils/paginator';
import { takeUntil } from 'rxjs';

import { PromptEntry } from '../services';

const OFF = 0;
const NEXT_TO = 1;
const START = 0;
const LABEL = 0;
const VALUE = 0;

type tCallback = (value: number) => void;

export class SelectLinePrompt extends Base<
  Question & { choices: PromptEntry[]; moveValue: unknown; pageSize: number }
> {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);

    this.opt = {
      ...questions,
      prefix: chalk.green('?'),
      suffix: '',
    };
    this.selected = this.moveIndex = this.opt.choices.findIndex(
      (value) => Array.isArray(value) && value[VALUE] === this.opt.moveValue,
    );
    const events = observe(rl);
    events.normalizedUpKey
      .pipe(takeUntil(events.line))
      .forEach(this.onUpKey.bind(this));
    events.normalizedDownKey
      .pipe(takeUntil(events.line))
      .forEach(this.onDownKey.bind(this));
    events.line.forEach(this.onSubmit.bind(this));
  }

  private done: tCallback;
  private firstRender = true;
  private moveIndex: number;
  private paginator: Paginator = new Paginator(this.screen, {
    isInfinite: false,
  });
  private selected = OFF;

  public _run(callback: tCallback): this {
    this.done = callback;
    cliCursor.hide();
    this.render();
    return this;
  }

  private getChoices(): PromptEntry[] {
    return this.opt.choices;
  }

  private getPlaceholder(): PromptEntry {
    return new Separator(chalk.bold`{cyan >>} {magenta move here} {cyan <<}`);
  }

  private listRender(choices: PromptEntry[]): string {
    const output: string[] = [];
    choices.forEach((choice, index) => {
      if (!Array.isArray(choice)) {
        output.push('  ' + choice + '\n');
        return;
      }
      let line = choice[LABEL] as string;
      if (choice[VALUE] === this.opt.moveValue) {
        line = chalk.cyan(line);
        if (index === this.selected) {
          line = chalk`${line} {magenta.bold current position}`;
        }
      }
      output.push(line);
    });
    return output.join(`\n`);
  }

  private onDownKey(): void {
    const length = this.getChoices().length;
    this.selected = this.selected < length ? this.selected + UP : START;
    if (this.selected === this.moveIndex + NEXT_TO) {
      this.selected = this.selected < length ? this.selected + UP : START;
    }
    this.render();
  }

  private onSubmit(): void {
    this.status = 'answered';
    this.render();
    this.screen.done();
    cliCursor.show();
    this.done(this.selected);
  }

  private onUpKey(): void {
    const length = this.getChoices().length;
    this.selected = this.selected > OFF ? this.selected + DOWN : length;
    if (this.selected === this.moveIndex + NEXT_TO) {
      this.selected = this.selected < length ? this.selected + DOWN : START;
    }
    this.render();
  }

  private render(): void {
    let message = this.getQuestion();
    if (this.firstRender) {
      message += chalk.dim('(Use arrow keys)');
    }
    const choices = this.getChoices().slice(START, this.selected);
    if (this.selected !== this.moveIndex) {
      choices.push(this.getPlaceholder());
    }
    choices.push(...this.getChoices().slice(this.selected));
    const choicesString = this.listRender(choices);
    message +=
      '\n' +
      this.paginator.paginate(choicesString, this.selected, this.opt.pageSize);

    this.firstRender = false;
    this.screen.render(message, '');
  }
}
