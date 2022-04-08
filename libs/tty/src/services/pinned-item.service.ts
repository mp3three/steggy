import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AutoConfigService, InjectConfig } from '@steggy/boilerplate';
import { is } from '@steggy/utilities';

import { LIB_TTY, PINNED_ITEMS } from '../config';
import { PromptEntry } from './prompt.service';

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
    @InjectConfig(PINNED_ITEMS) private pinned: PinnedItemDTO<T>[],
  ) {
    this.pinned = pinned.map(item =>
      is.string(item) ? JSON.parse(item) : item,
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
    return this.pinned.find(i => i.script === script && id === i.id);
  }

  public getEntries(name?: string): PromptEntry<PinnedItemDTO<T>>[] {
    if (!name) {
      return this.pinned.map(i => {
        return [i.friendlyName, i];
      });
    }
    return [];
  }

  public isPinned(script: string, id: string): boolean {
    return !is.undefined(this.findPin(script, id));
  }

  public removePinned(item: PinnedItemDTO<T>): void {
    this.pinned = this.pinned.filter(i => i !== item);
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
