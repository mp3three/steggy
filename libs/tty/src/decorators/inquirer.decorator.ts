import { is } from '@automagical/utilities';
import { INestApplication } from '@nestjs/common';
import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import { Question } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';

import { ICONS, KeyDescriptor, tKeyMap } from '../contracts';

type tCallback<T = unknown> = (value?: T) => void;

let app: INestApplication;

export abstract class InquirerPrompt<
  OPTIONS extends unknown = Record<string, unknown>,
  VALUE extends unknown = unknown,
> extends Base<Question & OPTIONS> {
  public static loadApp(load: INestApplication) {
    app = load;
  }

  protected done: tCallback<VALUE>;
  protected localKeyMap: tKeyMap;

  protected abstract onInit(app: INestApplication): void | Promise<void>;
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
    this.done();
    cliCursor.show();
  }

  protected setKeyMap(map: tKeyMap): void {
    this.localKeyMap = map;
    // Sanity check to make sure all the methods actually exist
    map.forEach(key => {
      if (is.undefined(this[key as string])) {
        console.log(
          chalk.yellow
            .inverse` ${ICONS.WARNING}MISSING CALLBACK {bold ${key}} `,
        );
      }
    });
  }

  private keyPressHandler(descriptor: KeyDescriptor): void {
    if (this.status === 'answered') {
      return;
    }
    const { key } = descriptor;
    const mixed = key?.name ?? key?.sequence ?? 'enter';

    this.localKeyMap.forEach((key, options) => {
      options.key ??= [];
      options.key = Array.isArray(options.key) ? options.key : [options.key];
      if (is.undefined[this[key as string]]) {
        console.log(`Missing localKeyMap callback ${key}`);
      }
      if (is.empty(options.key)) {
        this[key as string](mixed);
        return;
      }
      if (!options.key.includes(mixed)) {
        return;
      }
      const result = this[key as string](mixed);
      if (result === false) {
        return;
      }
      this.render();
    });
  }
}
