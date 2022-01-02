import { INestApplication } from '@nestjs/common';
import { is } from '@text-based/utilities';
import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import { Question } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';

import { ICONS, KeyDescriptor } from '../contracts';

type DirectCB = (key: string) => void | boolean | Promise<void | boolean>;
type tCallback<T = unknown> = (value?: T) => void;
export type tKeyMap<KEYS extends string | DirectCB = string> = Map<
  InquirerKeypressOptions,
  KEYS
>;
interface InquirerKeypressOptions {
  catchAll?: boolean;
  description?: string;
  key?: string | string[];
  noHelp?: boolean;
}

let app: INestApplication;

export abstract class InquirerPrompt<
  OPTIONS extends unknown = Record<string, unknown>,
  VALUE extends unknown = unknown,
> extends Base<Question & OPTIONS> {
  public static forRoot(load: INestApplication) {
    app = load;
  }

  protected done: tCallback<VALUE>;
  private localKeyMap: tKeyMap;

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
    cliCursor.show();
  }

  protected setKeyMap(map: tKeyMap): void {
    this.localKeyMap = map;
    // Sanity check to make sure all the methods actually exist
    map.forEach((key) => {
      if (is.undefined(this[key])) {
        console.log(
          chalk.yellow
            .inverse` ${ICONS.WARNING}MISSING CALLBACK {bold ${key}} `,
        );
      }
    });
  }

  private activateKey(
    key: string | DirectCB,
    mixed: string,
  ): void | boolean | Promise<void | boolean> {
    if (is.function<DirectCB>(key)) {
      return key(mixed);
    }
    return this[key](mixed);
  }

  private keyPressHandler(descriptor: KeyDescriptor): void {
    if (this.status === 'answered') {
      return;
    }
    const { key } = descriptor;
    const mixed = key?.name ?? key?.sequence ?? 'enter';
    const catchAll: string[] = [];
    let caught = false;

    this.localKeyMap.forEach((key, options) => {
      if (options.catchAll) {
        catchAll.push(key);
        return;
      }
      options.key ??= [];
      options.key = Array.isArray(options.key) ? options.key : [options.key];
      if (is.undefined[this[key]]) {
        console.log(`Missing localKeyMap callback ${key}`);
      }
      if (is.empty(options.key)) {
        caught = true;
        this.activateKey(key, mixed);
        return;
      }
      if (!options.key.includes(mixed)) {
        return;
      }
      caught = true;
      const result = this.activateKey(key, mixed);
      if (result === false) {
        return;
      }
      this.render();
    });
    if (caught) {
      return;
    }
    catchAll.forEach((i) => this.activateKey(i, mixed));
  }
}
