import {
  AutoConfigService,
  InjectConfig,
  LIB_TTY,
  TitleCase,
} from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import chalk from 'chalk';

import { PINNED_ITEMS } from '../config';
import { PromptEntry } from './prompt.service';
import { SystemService } from './system.service';

export class PinnedItemDTO<T = unknown> {
  public data?: T;
  public friendlyName: string;
  public id: string;
  public script: string;
}

@Injectable()
export class PinnedItemService<T = unknown> {
  constructor(
    private readonly configService: AutoConfigService,
    private readonly systemService: SystemService,
    @InjectConfig(PINNED_ITEMS) private pinned: PinnedItemDTO<T>[],
  ) {
    this.pinned = pinned.map((item) =>
      typeof item === 'string' ? JSON.parse(item) : item,
    );
  }

  public readonly loaders = new Map<
    string,
    (data: PinnedItemDTO<T>) => Promise<void>
  >();

  public addPinned(item: PinnedItemDTO<T>): void {
    this.pinned.push(item);
    this.configService.set([LIB_TTY, PINNED_ITEMS], this.pinned, true);
  }

  public async exec(item: PinnedItemDTO<T>): Promise<void> {
    const callback = this.loaders.get(item.script);
    if (!callback) {
      throw new InternalServerErrorException();
    }
    await callback(item);
  }

  public findPin(script: string, id: string): PinnedItemDTO<T> {
    return this.pinned.find((i) => i.script === script && id === i.id);
  }

  public getEntries(
    name?: string,
  ): PromptEntry<PromptEntry<PinnedItemDTO<T>>>[] {
    if (!name) {
      return this.pinned.map((i) => {
        return [
          chalk`{bold.magenta ${TitleCase(i.script)}} ${i.friendlyName}`,
          [i.friendlyName, i],
        ];
      });
    }
    return [];
  }

  public isPinned(script: string, id: string): boolean {
    return typeof this.findPin(script, id) !== 'undefined';
  }

  public removePinned(item: PinnedItemDTO<T>): void {
    this.pinned = this.pinned.filter((i) => i !== item);
    this.configService.set([LIB_TTY, PINNED_ITEMS], this.pinned, true);
  }

  public toggle(item: PinnedItemDTO<T>): void {
    const found = this.pinned.find(
      ({ id, script }) => id === item.id && script === item.script,
    );
    if (!found) {
      this.addPinned(item);
      return;
    }
    this.removePinned(found);
  }
}
