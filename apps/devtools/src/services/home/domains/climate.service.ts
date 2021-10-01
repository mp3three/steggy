import { EcobeeClimateStateDTO } from '@automagical/home-assistant';
import { CANCEL, PromptMenuItems } from '@automagical/tty';
import { TitleCase } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { SwitchService } from './switch.service';

@Injectable()
export class ClimateService extends SwitchService {
  public async processId(id: string): Promise<string> {
    const state = await this.header(id);
    const action = await super.processId(id);
    switch (action) {
      case 'setFanMode':
        await this.setFanMode(id, state);
        return await this.processId(id);
      case 'setHumidity':
        await this.setHumidity(id, state);
        return await this.processId(id);
      case 'setHvacMode':
        await this.setHvacMode(id, state);
        return await this.processId(id);
      case 'setPresetMode':
        await this.setPresetMode(id, state);
        return await this.processId(id);
      case 'setSwingMode':
        await this.setSwingMode(id, state);
        return await this.processId(id);
      case 'setTemperature':
        await this.setTemperature(id, state);
        return await this.processId(id);
    }
    return action;
  }

  public async setFanMode(
    id: string,
    state: EcobeeClimateStateDTO,
  ): Promise<void> {
    const mode = await this.promptService.menuSelect(
      state.attributes.fan_modes.map((mode) => ({
        name: TitleCase(mode),
        value: mode,
      })),
    );
    if (mode === CANCEL) {
      return;
    }
    await this.fetchService.fetch({
      body: { mode },
      method: 'put',
      url: `/entity/${id}/setFanMode`,
    });
  }

  public async setHumidity(
    id: string,
    state: EcobeeClimateStateDTO,
  ): Promise<void> {
    //
  }

  public async setHvacMode(
    id: string,
    state: EcobeeClimateStateDTO,
  ): Promise<void> {
    const mode = await this.promptService.menuSelect(
      state.attributes.hvac_modes.map((mode) => ({
        name: TitleCase(mode),
        value: mode,
      })),
    );
    if (mode === CANCEL) {
      return;
    }
    await this.fetchService.fetch({
      body: { mode },
      method: 'put',
      url: `/entity/${id}/setHvacMode`,
    });
  }

  public async setPresetMode(
    id: string,
    state: EcobeeClimateStateDTO,
  ): Promise<void> {
    const mode = await this.promptService.menuSelect(
      state.attributes.preset_modes.map((mode) => ({
        name: TitleCase(mode),
        value: mode,
      })),
    );
    if (mode === CANCEL) {
      return;
    }
    await this.fetchService.fetch({
      body: { mode },
      method: 'put',
      url: `/entity/${id}/setPresetMode`,
    });
  }

  public async setSwingMode(
    id: string,
    state: EcobeeClimateStateDTO,
  ): Promise<void> {
    const mode = await this.promptService.menuSelect(
      state.attributes.swing_modes.map((mode) => ({
        name: TitleCase(mode),
        value: mode,
      })),
    );
    if (mode === CANCEL) {
      return;
    }
    await this.fetchService.fetch({
      body: { mode },
      method: 'put',
      url: `/entity/${id}/setSwingMode`,
    });
  }

  public async setTemperature(
    id: string,
    state: EcobeeClimateStateDTO,
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
      url: `/entity/${id}/setTemperature`,
    });
    this.logger.debug({ result });
  }

  protected getMenuOptions(): PromptMenuItems {
    const list: PromptMenuItems = [];
    return [
      ...list,
      { name: 'Set Fan Mode', value: 'setFanMode' },
      // { name: 'Set Humidity', value: 'setHumidity' },
      { name: 'Set Hvac Mode', value: 'setHvacMode' },
      { name: 'Set Preset Mode', value: 'setPresetMode' },
      { name: 'Set Swing Mode', value: 'setSwingMode' },
      { name: 'Set Temperature', value: 'setTemperature' },
      ...super.getMenuOptions(),
    ];
  }

  private async header(id: string): Promise<EcobeeClimateStateDTO> {
    const content = await this.baseHeader<EcobeeClimateStateDTO>(id);
    const messages = [
      `Entity id: ${content.entity_id}`,
      `State: ${content.state}`,
    ];
    const { attributes } = content;
    if (attributes.temperature) {
      messages.push(`Temperature: ${attributes.temperature}`);
    }
    if (attributes.target_temp_high) {
      messages.push(`Target temp high: ${attributes.target_temp_high}`);
    }
    if (attributes.target_temp_low) {
      messages.push(`Target temp low: ${attributes.target_temp_low}`);
    }
    console.log([...messages, ``].join(`\n`));
    return content;
  }
}
