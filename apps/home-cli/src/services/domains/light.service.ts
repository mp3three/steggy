import {
  LIGHTING_MODE,
  LightingCacheDTO,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-logic';
import { HASS_DOMAINS, LightStateDTO } from '@automagical/home-assistant';
import { ICONS, PromptEntry } from '@automagical/tty';
import { Injectable } from '@nestjs/common';

import { SwitchService } from './switch.service';

const START = 0;
const SHIFT_AMOUNT = 2;

@Injectable()
export class LightService extends SwitchService {
  public async circadianLight(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/circadianLight`,
    });
  }

  public async createSaveCommand(
    entity_id: string,
    current?: RoomEntitySaveStateDTO<LightingCacheDTO>,
  ): Promise<RoomEntitySaveStateDTO> {
    let defaultValue: string;
    if (current) {
      if (current.state === 'off') {
        defaultValue = 'off';
      } else if (current?.extra?.mode === LIGHTING_MODE.circadian) {
        defaultValue = 'circadian';
      } else {
        defaultValue = 'on';
      }
    }
    const state = await this.promptService.pickOne(
      entity_id,
      [
        [`${ICONS.TURN_ON}Turn On`, 'on'],
        [`${ICONS.TURN_OFF}Turn Off`, 'off'],
        [`${ICONS.CIRCADIAN}Circadian Light`, 'circadian'],
      ],
      defaultValue,
    );
    if (state === 'off') {
      return {
        ref: entity_id,
        state,
      };
    }
    const mode =
      state === 'circadian' ? LIGHTING_MODE.circadian : LIGHTING_MODE.on;
    let brightness: number;
    if (
      current?.extra?.brightness ||
      (await this.promptService.confirm(`Set brightness?`))
    ) {
      brightness = await this.promptService.brightness(
        current?.extra?.brightness,
      );
    }
    return {
      extra: { brightness, mode },
      ref: entity_id,
      state: 'on',
    };
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
    await this.baseHeader(id);
    // const content = await this.getState<LightStateDTO>(id);
    // const baseMessage = chalk`{magenta.bold ${
    //   content.attributes.friendly_name
    // }} - {yellow.bold ${TitleCase(domain(content.entity_id))}}   `;
    // if (content.state === 'on') {
    //   const [r, g, b] = content.attributes.rgb_color;
    //   const message = `     ${TitleCase(content.state)}     `;
    //   const isBright =
    //     Math.sqrt(
    //       R_MULTIPLIER * (r * r) +
    //         G_MULTIPLIER * (g * g) +
    //         B_MULTIPLIER * (b * b),
    //     ) > THRESHOLD;
    //   console.log(
    //     baseMessage +
    //       chalk[isBright ? 'black' : 'whiteBright'].bgRgb(r, g, b)(message),
    //   );
    // } else {
    //   console.log(baseMessage);
    // }

    // console.log();
    // this.promptService.print(dump(content));
    // console.log();

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
      case 'swapState':
        await this.swapState(id);
        return await this.processId(id, action);
    }
    return action;
  }

  public async swapState(id: string, withinList?: string[]): Promise<void> {
    const state = await this.getState<LightStateDTO>(id);
    const swapWith = await this.pickFromDomain<LightStateDTO>(
      HASS_DOMAINS.light,
      withinList,
    );
    await this.setState(swapWith.entity_id, {
      brightness: state.attributes.brightness,
      hs_color: state.attributes.hs_color,
    });
    await this.setState(state.entity_id, {
      brightness: swapWith.attributes.brightness,
      hs_color: swapWith.attributes.hs_color,
    });
  }

  protected getMenuOptions(): PromptEntry[] {
    const parent = super.getMenuOptions();
    return [
      ...parent.slice(START, SHIFT_AMOUNT),
      [`${ICONS.CIRCADIAN}Circadian light`, 'circadianLight'],
      [`${ICONS.UP}Dim Up`, 'dimUp'],
      [`${ICONS.DOWN}Dim Down`, 'dimDown'],
      [`${ICONS.SWAP}Swap state with another light`, 'swapState'],
      ...parent.slice(SHIFT_AMOUNT),
    ];
  }

  private async setState(
    id: string,
    body: Partial<LightingCacheDTO>,
  ): Promise<void> {
    await this.fetchService.fetch({
      body,
      method: 'put',
      url: `/entity/light-state/${id}`,
    });
  }
}
