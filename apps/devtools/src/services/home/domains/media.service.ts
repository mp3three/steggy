import { PromptMenuItems } from '@automagical/tty';
import { Injectable } from '@nestjs/common';

import { SwitchService } from './switch.service';

@Injectable()
export class MediaService extends SwitchService {
  public async mute(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/mute`,
    });
  }

  public async playPause(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/playPause`,
    });
  }

  public async processId(id: string, command?: string): Promise<string> {
    const action = await super.processId(id, command);
    switch (action) {
      case 'mute':
        await this.mute(id);
        return await this.processId(id, action);
      case 'playPause':
        await this.playPause(id);
        return await this.processId(id, action);
      case 'toggle':
        await this.toggle(id);
        return await this.processId(id, action);
      case 'volumeDown':
        await this.volumeDown(id);
        return await this.processId(id, action);
      case 'volumeUp':
        await this.volumeUp(id);
        return await this.processId(id, action);
    }
    return action;
  }

  public async toggle(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/toggle`,
    });
  }

  public async volumeDown(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/volumeDown`,
    });
  }

  public async volumeUp(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/volumeUp`,
    });
  }

  protected getMenuOptions(): PromptMenuItems {
    return [
      { name: 'Play / Pause', value: 'playPause' },
      { name: 'Toggle', value: 'toggle' },
      { name: 'Volume Up', value: 'volumeUp' },
      { name: 'Volume Down', value: 'volumeDown' },
      { name: 'Mute', value: 'mute' },
      ...super.getMenuOptions(),
    ];
  }
}
