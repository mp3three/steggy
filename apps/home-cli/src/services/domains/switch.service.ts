import { RoomEntitySaveStateDTO } from '@for-science/controller-logic';
import { domain } from '@for-science/home-assistant';
import { ICONS, KeyMap, PromptEntry } from '@for-science/tty';
import { sleep, TitleCase } from '@for-science/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';

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
      case 'toggle':
        await this.toggle(id);
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

  protected buildKeymap(id: string): KeyMap {
    return {
      ...super.buildKeymap(id),
      e: [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
      f: [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
      t: [`${ICONS.TOGGLE_ON}Toggle`, 'toggle'],
    };
  }

  protected getMenuOptions(): PromptEntry[] {
    return [
      new inquirer.Separator(`Switch commands`),
      [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
      [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
      [`${ICONS.TOGGLE_ON}Toggle`, 'toggle'],
      ...super.getMenuOptions(),
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
