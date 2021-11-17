import {
  AutoConfigService,
  InjectConfig,
  LIB_TTY,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { PINNED_ITEMS } from '../config';
import { PromptEntry } from './prompt.service';
import { SystemService } from './system.service';

export class PinnedItemDTO<T> {
  public data: T;
  public id: string;
  public name: string;
}

@Injectable()
export class PinnedItemService<T> {
  constructor(
    private readonly configService: AutoConfigService,
    private readonly systemService: SystemService,
    @InjectConfig(PINNED_ITEMS) private pinned: PinnedItemDTO<T>[],
  ) {}

  public readonly loaders = new Map<string, (data: T) => Promise<void>>();

  public addPinned(name: string, id: string, data: T): void {
    this.pinned.push({ data, id, name });
    this.configService.set([LIB_TTY, PINNED_ITEMS], this.pinned, true);
  }

  public async exec(item: PinnedItemDTO<T>): Promise<void> {
    await item;
  }

  public getEntries(name?: string): PromptEntry<PinnedItemDTO<T>>[] {
    if (!name) {
      return this.pinned.map((i) => {
        return [i.name, i];
      });
    }
    return [];
  }

  public removePinned(item: PinnedItemDTO<T>): void {
    this.pinned = this.pinned.filter((i) => i !== item);
    this.configService.set([LIB_TTY, PINNED_ITEMS], this.pinned, true);
  }
}
