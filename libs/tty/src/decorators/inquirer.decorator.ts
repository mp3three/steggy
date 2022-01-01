import { INestApplication, Type } from '@nestjs/common';
import { is } from '@text-based/utilities';
import cliCursor from 'cli-cursor';
import { Question } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';

import { KeyDescriptor } from '../contracts';

type tCallback = (value?: unknown) => void;
interface InquirerKeypressOptions {
  key: string;
}

let app: INestApplication;

export abstract class InquirerPrompt<
  options extends unknown = Record<string, unknown>,
> extends Base<Question & options> {
  public static loadApp(load: INestApplication) {
    app = load;
  }

  protected done: tCallback;
  protected localKeyMap: Map<InquirerKeypressOptions, string>;
  private injectables: Record<string, Type> = {};

  protected abstract render(): void;

  protected async _run(callback: tCallback) {
    await this.onInit(app);
    this.done = callback;
    const events = observe(this.rl);

    events.keypress.forEach(this.keyPressHandler.bind(this));
    events.line.forEach(this.keyPressHandler.bind(this));
    cliCursor.hide();
    this.render();
    return this;
  }

  protected onEnd(): void {
    this.status = 'answered';
    this.render();
    this.screen.done();
    cliCursor.show();
    this.done();
  }

  protected async onInit(app: INestApplication): Promise<void> {
    await app;
  }

  private keyPressHandler(descriptor: KeyDescriptor): void {
    if (this.status === 'answered') {
      return;
    }
    const { key } = descriptor;
    const mixed = key.name ?? key.sequence;
    this.localKeyMap.forEach((key, options) => {
      if (is.empty(options.key)) {
        this[key](descriptor);
        return;
      }
      if (options.key !== mixed) {
        return;
      }
      const result = this[key]();
      if (result === false) {
        return;
      }
      this.render();
    });
  }
}
