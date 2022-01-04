import { INestApplication } from '@nestjs/common';
import { each, is } from '@text-based/utilities';
import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import { Question } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';

import { ICONS, KeyDescriptor } from '../contracts';

export type KeyModifiers = Record<'ctrl' | 'shift' | 'meta', boolean>;
export type DirectCB = (
  key: string,
  mods: KeyModifiers,
) => void | boolean | Promise<void | boolean>;
type tCallback<T = unknown> = (value?: T) => void;
export type tKeyMap = Map<InquirerKeypressOptions, string | DirectCB>;
export interface InquirerKeypressOptions {
  active?: () => boolean;
  catchAll?: boolean;
  description?: string;
  key?: string | string[];
  modifiers?: Partial<KeyModifiers>;
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

  public localKeyMap: tKeyMap;
  protected done: tCallback<VALUE>;

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
      if (is.string(key) && is.undefined(this[key])) {
        console.log(
          chalk.yellow
            .inverse` ${ICONS.WARNING}MISSING CALLBACK {bold ${key}} `,
        );
      }
    });
  }

  private async activateKey(
    key: string | DirectCB,
    mixed: string,
    modifiers: KeyModifiers,
  ): Promise<void | boolean | Promise<void | boolean>> {
    if (is.function<DirectCB>(key)) {
      return await key(mixed, modifiers);
    }
    return await this[key](mixed);
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private async keyPressHandler(descriptor: KeyDescriptor): Promise<void> {
    if (this.status === 'answered') {
      return;
    }
    const { key } = descriptor;
    const { ctrl, meta, shift, name, sequence } = key ?? {};
    const mixed = name ?? sequence ?? 'enter';
    const catchAll: (string | DirectCB)[] = [];
    let caught = false;
    const modifiers: KeyModifiers = { ctrl, meta, shift };

    await each([...this.localKeyMap.entries()], async ([options, key]) => {
      if (options.catchAll) {
        catchAll.push(key);
        return;
      }
      if (!is.undefined(options.active) && !options.active()) {
        return;
      }
      options.key ??= [];
      options.key = Array.isArray(options.key) ? options.key : [options.key];
      if (is.string(key) && is.undefined(this[key])) {
        console.log(`Missing localKeyMap callback ${key}`);
      }
      if (is.empty(options.key)) {
        caught = true;
        await this.activateKey(key, mixed, modifiers);
        return;
      }
      if (!options.key.includes(mixed)) {
        return;
      }
      if (options.modifiers) {
        const state = Object.entries(options.modifiers).every(
          ([type, value]) => modifiers[type] === value,
        );
        if (!state) {
          return;
        }
      }
      caught = true;
      const result = await this.activateKey(key, mixed, modifiers);
      if (result === false) {
        return;
      }
      this.render();
    });
    if (caught) {
      return;
    }
    each(catchAll, async (i) => await this.activateKey(i, mixed, modifiers));
  }
}
