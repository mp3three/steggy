import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import { Question } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';

type tCallback = (value?: unknown) => void;

export class AcknowledgePrompt extends Base<Question> {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);
  }

  private done: tCallback;

  public _run(callback: tCallback): this {
    this.done = callback;
    const events = observe(this.rl);
    events.keypress.forEach(this.onKeypress.bind(this));
    events.line.forEach(this.onEnd.bind(this));

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
      this.screen.render(``, '');
      return;
    }
    this.screen.render(chalk`Any key to continue`, '');
  }
}
