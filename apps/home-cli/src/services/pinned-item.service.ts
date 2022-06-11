import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConfig } from '@steggy/boilerplate';
import {
  InflatedPinDTO,
  PersonDTO,
  PinnedItemDTO,
} from '@steggy/controller-shared';
import { MainMenuEntry } from '@steggy/tty';
import { is, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';

import { USER_ID } from '../config';
import { ICONS } from '../types';
import { HomeFetchService } from './home-fetch.service';

const NO_DESCRIPTION = chalk.gray(`No description`);

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
  private pinned: InflatedPinDTO[] = [];

  public async addPinned(item: PinnedItemDTO): Promise<void> {
    this.person = await this.fetchService.fetch({
      method: 'post',
      url: `/person/${this.userId}/pin/${item.type}/${item.target}`,
    });
    await this.refresh();
  }

  public async exec(item: InflatedPinDTO): Promise<void> {
    const callback = this.loaders.get(item.type);
    if (!callback) {
      throw new InternalServerErrorException();
    }
    await callback({
      target: item.id,
      type: item.type,
    });
  }

  public findPin(type: string, id: string): InflatedPinDTO {
    return this.pinned.find(i => i.type === type && id === i.id);
  }

  public getEntries(): MainMenuEntry<InflatedPinDTO>[] {
    return this.pinned.map(item => {
      const icon = item.type.includes('state') ? ICONS.ACTIVATE : '';
      let helpText = is.empty(icon)
        ? item.description || NO_DESCRIPTION
        : item.description || 'Activate state';
      if (!is.empty(item.extraHelp)) {
        helpText += chalk`\n{magenta **} ${item.extraHelp.join(
          chalk.blue` > `,
        )}`;
      } else if (helpText === NO_DESCRIPTION) {
        helpText = undefined;
      }
      return {
        entry: [
          icon + item.friendlyName.map(item => item).join(chalk.cyan` > `),
          item,
        ],
        helpText,
        type: TitleCase(item.type),
      } as MainMenuEntry<InflatedPinDTO>;
    });
  }

  public isPinned(type: string, target: string): boolean {
    return !!this.findPin(type, target);
  }

  public async removePinned(item: PinnedItemDTO): Promise<void> {
    this.person = await this.fetchService.fetch({
      method: 'delete',
      url: `/person/${this.userId}/pin/${item.type}/${item.target}`,
    });
    await this.refresh();
  }

  public toggle(item: PinnedItemDTO): void {
    const found = this.person.pinned_items.find(
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
    this.person = await this.fetchService.fetch({
      url: `/person/${this.userId}`,
    });
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    this.pinned = await this.fetchService.fetch({
      url: `/person/${this.userId}/pin`,
    });
  }
}
