import { Injectable } from '@nestjs/common';
import { each, is } from '@steggy/utilities';
import chalk from 'chalk';
import { fromEvent, takeUntil } from 'rxjs';

import {
  ApplicationStackProvider,
  DirectCB,
  ICONS,
  iStackProvider,
  KeyDescriptor,
  KeyModifiers,
  tKeyMap,
} from '../../contracts';
import { ApplicationManagerService } from './application-manager.service';
import { ScreenService } from './screen.service';

@Injectable()
@ApplicationStackProvider()
export class KeyboardManagerService implements iStackProvider {
  constructor(
    private readonly screenService: ScreenService,
    private readonly applicationManager: ApplicationManagerService,
  ) {}
  private activeKeymaps: Map<unknown, tKeyMap> = new Map();

  public focus<T>(
    target: unknown,
    map: tKeyMap,
    value: Promise<T>,
  ): Promise<T> {
    return new Promise(async done => {
      const currentMap = this.activeKeymaps;
      this.activeKeymaps = new Map([[target, map]]);
      const out = await value;
      this.activeKeymaps = currentMap;
      done(out);
    });
  }

  public getCombinedKeyMap(): tKeyMap {
    const map: tKeyMap = new Map();
    this.activeKeymaps.forEach(sub => sub.forEach((a, b) => map.set(b, a)));
    return map;
  }
  public load(item: Map<unknown, tKeyMap>): void {
    this.activeKeymaps = item;
  }

  public save(): Map<unknown, tKeyMap> {
    const current = this.activeKeymaps;
    this.activeKeymaps = new Map();
    return current;
  }

  public setKeyMap(target: unknown, map: tKeyMap): void {
    this.activeKeymaps.set(target, map);
    map.forEach(key => {
      if (is.string(key) && !is.function(target[key])) {
        this.screenService.print(
          chalk.yellow
            .inverse` ${ICONS.WARNING}MISSING CALLBACK {bold ${key}} `,
        );
      }
    });
  }

  public wrap<T>(callback: () => Promise<T>): Promise<T> {
    return new Promise(async done => {
      const map = this.save();
      const result = await callback();
      this.load(map);
      done(result);
    });
  }

  protected onApplicationBootstrap(): void {
    const rl = this.screenService.rl;
    fromEvent(rl.input, 'keypress', (value, key = {}) => ({ key, value }))
      .pipe(takeUntil(fromEvent(rl, 'close')))
      .forEach(this.keyPressHandler.bind(this));
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private async keyPressHandler(descriptor: KeyDescriptor): Promise<void> {
    const { key } = descriptor;
    const { ctrl, meta, shift, name, sequence } = key ?? {};
    let mixed = name ?? sequence ?? 'enter';
    // Standardize the "done" key
    mixed = mixed === 'return' ? 'enter' : mixed;
    const catchAll: [unknown, string | DirectCB][] = [];
    const direct: [unknown, string | DirectCB][] = [];
    const modifiers: KeyModifiers = { ctrl, meta, shift };

    // Build list of callbacks based on key
    this.activeKeymaps.forEach((map, target) => {
      map.forEach((callback, options) => {
        if (is.undefined(options.key)) {
          catchAll.push([target, callback]);
          return;
        }
        const keys = Array.isArray(options.key) ? options.key : [options.key];
        if (!keys.includes(mixed)) {
          return;
        }
        const allMatch = Object.entries(modifiers).every(
          ([modifier, value]) => modifiers[modifier] === value,
        );
        if (!allMatch) {
          return;
        }
        direct.push([target, callback]);
      });
    });
    // If there are any that directly look for this combination, then only use those
    // Otherwise, use all the catchall callbacks
    const list = is.empty(direct) ? catchAll : direct;
    // Do not re-render if no listeners are present at all
    // This happens when the application releases control for inquirer to take over
    let render = !is.empty(list);
    await each(is.empty(direct) ? catchAll : direct, async ([target, key]) => {
      const result = await (is.string(key) ? target[key].bind(target) : key)(
        mixed,
        modifiers,
      );
      if (result === false) {
        // This logic needs to be improved
        // If any single one of these returns false, then a render is stopped
        render = false;
      }
    });
    if (render) {
      this.applicationManager.render();
    }
  }
}
