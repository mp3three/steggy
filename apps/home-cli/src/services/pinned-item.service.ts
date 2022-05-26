import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConfig } from '@steggy/boilerplate';
import { PersonDTO, PinnedItemDTO } from '@steggy/controller-shared';
import { PromptEntry } from '@steggy/tty';
import { is } from '@steggy/utilities';

import { USER_ID } from '../config';
import { HomeFetchService } from './home-fetch.service';

@Injectable()
export class PinnedItemService {
  constructor(
    @InjectConfig(USER_ID) private readonly userId: string,
    private readonly fetchService: HomeFetchService,
  ) {}

  public readonly loaders = new Map<
    string,
    (data: PinnedItemDTO) => Promise<void>
  >();
  public person: PersonDTO;
  private pinned: PinnedItemDTO[] = [];

  public addPinned(item: PinnedItemDTO): void {
    this.pinned.push(item);
    this.person.pinned_items.push(item);
    // this.configService.set([LIB_TTY, PINNED_ITEMS], this.pinned, true);
  }

  public async exec(item: PinnedItemDTO): Promise<void> {
    const callback = this.loaders.get(item.type);
    if (!callback) {
      throw new InternalServerErrorException();
    }
    await callback(item);
  }

  public findPin(type: string, id: string): PinnedItemDTO {
    return this.pinned.find(i => i.type === type && id === i.target);
  }

  public getEntries(name?: string): PromptEntry<PinnedItemDTO>[] {
    if (!name) {
      return this.pinned.map(i => {
        return [i.target, i];
      });
    }
    return [];
  }

  public isPinned(type: string, target: string): boolean {
    return !is.undefined(this.findPin(type, target));
  }

  public removePinned(item: PinnedItemDTO): void {
    this.pinned = this.pinned.filter(i => i !== item);
    // this.configService.set([LIB_TTY, PINNED_ITEMS], this.pinned, true);
  }

  public toggle(item: PinnedItemDTO): void {
    const found = this.pinned.find(
      ({ target, type }) => target === item.target && type === item.type,
    );
    if (!found) {
      this.addPinned(item);
      return;
    }
    this.removePinned(found);
  }

  protected async onApplicationBootstrap(): Promise<void> {
    if (is.empty(this.userId)) {
      return;
    }
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    this.person = await this.fetchService.fetch({
      url: `/person/${this.userId}`,
    });
  }
}
