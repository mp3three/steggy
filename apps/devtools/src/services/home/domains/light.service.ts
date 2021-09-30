import { PromptMenuItems } from '@automagical/tty';
import { Injectable } from '@nestjs/common';

import { SwitchService } from './switch.service';

@Injectable()
export class LightService extends SwitchService {
  public async circadianLight(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/${id}/circadian`,
    });
  }

  public async dimDown(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/${id}/dimDown`,
    });
  }

  public async dimUp(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/${id}/dimUp`,
    });
  }

  public async processId(id: string): Promise<string> {
    const action = await super.processId(id);
    switch (action) {
      case 'dimDown':
        await this.dimDown(id);
        return await this.processId(id);
      case 'dimUp':
        await this.dimUp(id);
        return await this.processId(id);
      case 'circadianLight':
        await this.circadianLight(id);
        return await this.processId(id);
    }
    return action;
  }

  protected getMenuOptions(): PromptMenuItems {
    return [
      { name: 'Circadian light', value: 'circadianLight' },
      { name: 'Dim Up', value: 'dimUp' },
      { name: 'Dim Down', value: 'dimDown' },
      ...super.getMenuOptions(),
    ];
  }
}
