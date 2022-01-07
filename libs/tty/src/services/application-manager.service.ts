import { Injectable } from '@nestjs/common';
import { each, is } from '@text-based/utilities';
import chalk from 'chalk';
import { fromEvent, takeUntil } from 'rxjs';

import {
  ApplicationStackItem,
  ApplicationStackProvider,
  DirectCB,
  ICONS,
  iStackProvider,
  KeyDescriptor,
  KeyModifiers,
  tKeyMap,
} from '../contracts';
import { iComponent } from '../decorators';
import { ComponentExplorerService } from './explorers';
import { PromptService } from './prompt.service';
import { ScreenService } from './render';
import { StackService } from './stack.service';

// ? Is there anything else that needs to be kept track of?
const STACK: Map<unknown, tKeyMap>[] = [];

@Injectable()
@ApplicationStackProvider()
export class ApplicationManagerService implements iStackProvider {
  constructor(
    private readonly componentExplorer: ComponentExplorerService,
    private readonly promptService: PromptService,
    private readonly stackService: StackService,
    private readonly screenService: ScreenService,
  ) {}

  private activeApplication: iComponent;
  private activeKeymaps: Map<unknown, tKeyMap>;

  public async activate<CONFIG, VALUE>(
    name: string,
    configuration: CONFIG,
  ): Promise<VALUE> {
    STACK.push(this.activeKeymaps);
    this.reset();
    return await new Promise((done) => {
      const component = this.componentExplorer.findServiceByType<CONFIG, VALUE>(
        name,
      );
      // There needs to be more type work around this
      // It's a disaster
      component.configure(configuration, (value) => {
        done(value as VALUE);
        this.activeKeymaps = STACK.pop();
      });
      this.activeApplication = component;
      component.render();
    });
  }

  public getCombinedKeyMap(): tKeyMap {
    const map: tKeyMap = new Map();
    this.activeKeymaps.forEach((sub) => sub.forEach((a, b) => map.set(b, a)));
    return map;
  }

  public load(item: ApplicationStackItem): void {
    this.activeApplication = item.application;
  }

  public save(): Partial<ApplicationStackItem> {
    return {
      application: this.activeApplication,
    };
  }

  public setHeader(main: string, secondary?: string): void {
    this.promptService.clear();
    let header = this.promptService.scriptHeader(main);
    // this.screenService.setHeader()
    if (!is.empty(secondary)) {
      header += this.promptService.secondaryHeader(secondary);
    }
    this.screenService.setHeader(header);
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
      this.activeApplication.render();
    }
  }

  private reset(): void {
    this.activeKeymaps = new Map();
    this.activeApplication = undefined;
  }
}
