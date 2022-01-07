import { Injectable } from '@nestjs/common';
import { each, is } from '@text-based/utilities';
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

  public getCombinedKeyMap(): tKeyMap {
    const map: tKeyMap = new Map();
    this.activeKeymaps.forEach((sub) => sub.forEach((a, b) => map.set(b, a)));
    return map;
  }

  public load(item: Map<unknown, tKeyMap>): void {
    this.activeKeymaps = item;
  }

  public save(): Map<unknown, tKeyMap> {
    return this.activeKeymaps;
  }

  public setKeyMap(target: unknown, map: tKeyMap): void {
    this.activeKeymaps.set(target, map);
    map.forEach((key) => {
      if (is.string(key) && !is.function(target[key])) {
        console.log(
          chalk.yellow
            .inverse` ${ICONS.WARNING}MISSING CALLBACK {bold ${key}} `,
        );
      }
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
    let render = true;
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
      // this.activeApplication.render();
    }
  }
}
