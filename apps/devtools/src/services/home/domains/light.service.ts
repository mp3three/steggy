import { PromptMenuItems } from '@automagical/tty';
import { Injectable } from '@nestjs/common';

import { SwitchService } from './switch.service';

const START = 0;
const SHIFT_AMOUNT = 2;

@Injectable()
export class LightService extends SwitchService {
  public async circadianLight(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/circadian`,
    });
  }

  public async dimDown(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/dimDown`,
    });
  }

  public async dimUp(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/dimUp`,
    });
  }

  public async processId(id: string, command?: string): Promise<string> {
    const action = await super.processId(id, command);
    switch (action) {
      case 'dimDown':
        await this.dimDown(id);
        return await this.processId(id, action);
      case 'dimUp':
        await this.dimUp(id);
        return await this.processId(id, action);
      case 'circadianLight':
        await this.circadianLight(id);
        return await this.processId(id, action);
    }
    return action;
  }

  protected getMenuOptions(): PromptMenuItems {
    const parent = super.getMenuOptions();
    return [
      ...parent.slice(START, SHIFT_AMOUNT),
      { name: 'Circadian light', value: 'circadianLight' },
      { name: 'Dim Up', value: 'dimUp' },
      { name: 'Dim Down', value: 'dimDown' },
      ...parent.slice(SHIFT_AMOUNT),
    ];
  }
}
