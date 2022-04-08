import { ClimateStateDTO } from '@steggy/home-assistant-shared';
import { IsDone, PromptEntry, ToMenuEntry } from '@steggy/tty';
import { TitleCase } from '@steggy/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';

import { MENU_ITEMS } from '../../includes';
import { SwitchService } from './switch.service';

@Injectable()
export class ClimateService extends SwitchService {
  public async processId(id: string, command?: string): Promise<string> {
    const state = await this.baseHeader<ClimateStateDTO>(id);
    const action = await super.processId(id, command, true);
    switch (action) {
      case 'setFanMode':
        await this.setFanMode(id, state);
        return await this.processId(id, action);
      case 'setHumidity':
        await this.setHumidity(id, state);
        return await this.processId(id, action);
      case 'setHvacMode':
        await this.setHvacMode(id, state);
        return await this.processId(id, action);
      case 'setPresetMode':
        await this.setPresetMode(id, state);
        return await this.processId(id, action);
      case 'setSwingMode':
        await this.setSwingMode(id, state);
        return await this.processId(id, action);
      case 'setTemperature':
        await this.setTemperature(id, state);
        return await this.processId(id, action);
    }
    return action;
  }

  public async setFanMode(id: string, state: ClimateStateDTO): Promise<void> {
    const mode = await this.promptService.menu({
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry(
        state.attributes.fan_modes.map(mode => [TitleCase(mode), mode]),
      ),
      rightHeader: `Set fan mode`,
    });
    if (IsDone(mode)) {
      return;
    }
    await this.fetchService.fetch({
      body: { mode },
      method: 'put',
      url: `/entity/command/${id}/setFanMode`,
    });
  }

  public async setHumidity(id: string, state: ClimateStateDTO): Promise<void> {
    throw new NotImplementedException();
    id;
    await state;
  }

  public async setHvacMode(id: string, state: ClimateStateDTO): Promise<void> {
    const mode = await this.promptService.menu({
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry(
        state.attributes.hvac_modes.map(mode => [TitleCase(mode), mode]),
      ),
      rightHeader: `Set HVAC mode`,
    });
    if (IsDone(mode)) {
      return;
    }
    await this.fetchService.fetch({
      body: { mode },
      method: 'put',
      url: `/entity/command/${id}/setHvacMode`,
    });
  }

  public async setPresetMode(
    id: string,
    state: ClimateStateDTO,
  ): Promise<void> {
    const mode = await this.promptService.menu({
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry(
        state.attributes.preset_modes.map(mode => [TitleCase(mode), mode]),
      ),
      rightHeader: `Set preset mode`,
    });
    if (IsDone(mode)) {
      return;
    }
    await this.fetchService.fetch({
      body: { mode },
      method: 'put',
      url: `/entity/command/${id}/setPresetMode`,
    });
  }

  public async setSwingMode(id: string, state: ClimateStateDTO): Promise<void> {
    const mode = await this.promptService.menu({
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry(
        state.attributes.swing_modes.map(mode => [TitleCase(mode), mode]),
      ),
      rightHeader: `Set swing mode`,
    });
    if (IsDone(mode)) {
      return;
    }
    await this.fetchService.fetch({
      body: { mode },
      method: 'put',
      url: `/entity/command/${id}/setSwingMode`,
    });
  }

  public async setTemperature(
    id: string,
    state: ClimateStateDTO,
  ): Promise<void> {
    const data: Partial<
      Record<'temperature' | 'target_temp_high' | 'target_temp_low', number>
    > = {};
    if (state.attributes.temperature) {
      data.temperature = await this.promptService.number(
        `Target temperature`,
        state.attributes.temperature,
      );
    }
    if (state.attributes.target_temp_high) {
      data.target_temp_high = await this.promptService.number(
        `Target temperature high`,
        state.attributes.target_temp_high,
      );
    }
    if (state.attributes.target_temp_low) {
      data.target_temp_low = await this.promptService.number(
        `Target temperature low`,
        state.attributes.target_temp_low,
      );
    }
    const result = await this.fetchService.fetch({
      body: data,
      method: 'put',
      url: `/entity/command/${id}/setTemperature`,
    });
    this.logger.debug({ result });
  }

  protected getMenuOptions(): PromptEntry[] {
    return [
      ['Set Fan Mode', 'setFanMode'],
      ['Set Humidity', 'setHumidity'],
      ['Set Hvac Mode', 'setHvacMode'],
      ['Set Preset Mode', 'setPresetMode'],
      ['Set Swing Mode', 'setSwingMode'],
      ['Set Temperature', 'setTemperature'],
      ...super.getMenuOptions(),
    ];
  }
}
