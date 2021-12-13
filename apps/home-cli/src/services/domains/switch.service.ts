import { RoomEntitySaveStateDTO } from '@ccontour/controller-logic';
import { domain } from '@ccontour/home-assistant';
import { ICONS, PromptEntry } from '@ccontour/tty';
import { sleep, TitleCase } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

import { BaseDomainService } from './base-domain.service';

@Injectable()
export class SwitchService extends BaseDomainService {
  public async createSaveCommand(
    entity_id: string,
    current: Partial<RoomEntitySaveStateDTO> = {},
  ): Promise<RoomEntitySaveStateDTO> {
    const state = await this.promptService.pickOne(
      entity_id,
      [
        [`${ICONS.TURN_ON}Turn On`, 'on'],
        [`${ICONS.TURN_OFF}Turn Off`, 'off'],
        [`${ICONS.TOGGLE_ON}Toggle`, 'toggle'],
      ],
      current?.state,
    );
    return {
      ref: entity_id,
      state,
    };
  }

  public async processId(
    id: string,
    command?: string,
    skipHeader = false,
  ): Promise<string> {
    if (skipHeader === false) {
      await this.printHeader(id);
    }
    const action = await super.processId(id, command, skipHeader);
    switch (action) {
      case 'turnOn':
        await this.turnOn(id);
        return await this.processId(id, action);
      case 'turnOff':
        await this.turnOff(id);
        return await this.processId(id, action);
    }
    return action;
  }

  public async turnOff(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/turnOff`,
    });
  }

  public async turnOn(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/turnOn`,
    });
  }

  protected getMenuOptions(id: string): PromptEntry[] {
    return [
      [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
      [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
      ...super.getMenuOptions(id),
    ];
  }

  private async printHeader(id: string): Promise<void> {
    // sleep needed to ensure correct-ness of header information
    // Somtimes the previous request impacts the state, and race conditions
    await sleep(this.refreshSleep);
    this.promptService.clear();
    this.promptService.scriptHeader(TitleCase(domain(id)));
    const content = await this.getState(id);
    console.log(
      chalk` ${
        content.state === 'on' ? ICONS.TURN_ON : ICONS.TURN_OFF
      }{magenta.bold ${content.attributes.friendly_name}}`,
    );
    console.log();
  }
}
