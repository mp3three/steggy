import { Injectable } from '@nestjs/common';
import { each, is } from '@text-based/utilities';
import chalk from 'chalk';
import observe from 'inquirer/lib/utils/events';
import { filter, fromEvent, takeUntil } from 'rxjs';

import {
  DirectCB,
  ICONS,
  KeyDescriptor,
  KeyModifiers,
  tKeyMap,
} from '../contracts';
import { iComponent } from '../decorators';
import { ComponentExplorerService } from './explorers';
import { PromptService } from './prompt.service';
import { ScreenService } from './render';

@Injectable()
export class ApplicationManagerService {
  constructor(
    private readonly componentExplorer: ComponentExplorerService,
    private readonly promptService: PromptService,
    private readonly screenService: ScreenService,
  ) {}

  private activeApplication: iComponent;
  private activeKeymaps: Map<unknown, tKeyMap>;

  public async activate<CONFIG, VALUE>(
    name: string,
    configuration: CONFIG,
  ): Promise<VALUE> {
    this.reset();

    return await new Promise((done) => {
      const component = this.componentExplorer.findServiceByType<CONFIG, VALUE>(
        name,
      );
      // There needs to be more type work around this
      // It's a disaster
      component.configure(configuration, (value) => done(value as VALUE));
      this.activeApplication = component;
      component.render();
    });
  }

  public getCombinedKeyMap(): tKeyMap {
    const map: tKeyMap = new Map();
    this.activeKeymaps.forEach((sub) => sub.forEach((a, b) => map.set(b, a)));
    return map;
  }

  public setHeader(main: string, secondary?: string): void {
    this.promptService.clear();
    this.promptService.scriptHeader(main);
    if (!is.empty(secondary)) {
      this.promptService.secondaryHeader(secondary);
    }
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
    const mixed = name ?? sequence ?? 'enter';
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
      this.activeApplication.render();
    }
  }

  private reset(): void {
    this.activeKeymaps = new Map();
    this.activeApplication = undefined;
  }
}
