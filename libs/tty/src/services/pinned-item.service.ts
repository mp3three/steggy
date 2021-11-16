import { InjectConfig } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { PINNED_ITEMS } from '../config';
import { PromptEntry } from './prompt.service';
import { SystemService } from './system.service';

@Injectable()
export class PinnedItemService {
  constructor(
    private readonly systemService: SystemService,
    @InjectConfig(PINNED_ITEMS) private readonly pinned: unknown[],
  ) {}

  public readonly loaders = new Map<
    string,
    (arguments_: Record<string, unknown>) => Promise<void>
  >();

  public addPinned(name: string, data: Record<string, unknown>): void {
    //
  }
  public async exec(
    name: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    return;
  }

  public getEntries(type?: string): PromptEntry[] {
    return [];
  }

  public removePinned<T>(name: string, data: T): void {
    //
  }
}
