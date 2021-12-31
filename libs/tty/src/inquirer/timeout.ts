import { InternalServerErrorException } from '@nestjs/common';
import { ARRAY_OFFSET, FIRST, INCREMENT, is } from '@text-based/utilities';
import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import { Question } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';

import { KeyDescriptor } from '../contracts';

export enum TimeoutIntervals {
  second = 'second',
  minute = 'minute',
  hour = 'hour',
}
const MINIMUM = 0;
const REMOVE_AMOUNT = -1;
const DEFAULT_AMOUNT = 60;
const MINUTE = 60;
const HOUR = 3600;

export type TimeoutResult = { amount: number; interval: TimeoutIntervals };
type tCallback = (value: number) => void;

export class TimeoutPrompt extends Base<Question & Partial<TimeoutResult>> {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);

    this.opt = {
      ...questions,
      prefix: chalk.green('?'),
      suffix: '',
    };
  }

  private amount: string = DEFAULT_AMOUNT.toString();
  private done: tCallback;
  private firstRender = true;
  private interval: TimeoutIntervals = TimeoutIntervals.second;
  private mode: 'interval' | 'amount' = 'amount';

  public get currentValue(): TimeoutResult {
    return {
      amount: Number(this.amount),
      interval: this.interval,
    };
  }

  public _run(callback: tCallback): this {
    this.done = callback;

    const events = observe(this.rl);
    events.keypress.forEach(this.onKeypress.bind(this));
    events.line.forEach(this.onEnd.bind(this));

    cliCursor.hide();
    this.render();
    return this;
  }

  private onDownKey(): void {
    if (this.mode === 'amount') {
      const next = Number(this.amount) - INCREMENT;
      if (next < MINIMUM) {
        return;
      }
      this.amount = next.toString();
      return;
    }
    const list = Object.values(TimeoutIntervals);
    const current = list.indexOf(this.interval);
    if (current === list.length - ARRAY_OFFSET) {
      return;
    }
    this.interval = list[current + INCREMENT];
  }

  private onEnd(): void {
    this.status = 'answered';
    this.render();
    this.screen.done();
    cliCursor.show();
    const value = Number(this.amount);
    if (this.interval === TimeoutIntervals.second) {
      return this.done(value);
    }
    if (this.interval === TimeoutIntervals.minute) {
      return this.done(value * MINUTE);
    }
    if (this.interval === TimeoutIntervals.hour) {
      return this.done(value * HOUR);
    }
    throw new InternalServerErrorException();
  }

  private onKeypress({ key }: KeyDescriptor): void {
    if (key.ctrl || key.shift || key.meta || this.status === 'answered') {
      return;
    }
    const mixed = key.name ?? key.sequence;
    switch (mixed) {
      case 'delete':
        this.amount = '0';
        break;
      case 'backspace':
        this.amount = this.amount.slice(FIRST, REMOVE_AMOUNT);
        if (is.empty(this.amount)) {
          this.amount = '0';
        }
        break;
      case 'left':
        this.mode = 'amount';
        break;
      case 'right':
        this.mode = 'interval';
        break;
      case 'up':
        this.onUpKey();
        break;
      case 'down':
        this.onDownKey();
        break;
      case '0':
      case '.':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this.amount = `${this.amount === '0' ? '' : this.amount}${mixed}`;
        break;
      case 'h':
        this.interval = TimeoutIntervals.hour;
        break;
      case 'm':
        this.interval = TimeoutIntervals.minute;
        break;
      case 's':
        this.interval = TimeoutIntervals.second;
        break;
    }
    this.render();
  }

  private onUpKey(): void {
    if (this.mode === 'amount') {
      this.amount = (Number(this.amount) + INCREMENT).toString();
      return;
    }
    const list = Object.values(TimeoutIntervals);
    const current = list.indexOf(this.interval);
    if (current === FIRST) {
      return;
    }
    this.interval = list[current - INCREMENT];
  }

  private render(): void {
    let message = this.getQuestion() ?? 'Timeout duration';
    if (this.status === 'answered') {
      this.screen.render(
        chalk`${message}{cyan - }${this.amount} ${this.interval}`,
        '',
      );
      return;
    }
    message += chalk`{${this.mode === 'amount' ? 'inverse' : 'gray'} ${
      this.amount
    }} {${this.mode === 'interval' ? 'inverse' : 'gray'} ${this.interval}}`;
    if (this.firstRender) {
      message += chalk`\n{cyan   - }{dim Use arrow / number keys}`;
      this.firstRender = false;
    }
    this.screen.render(message, '');
  }
}
