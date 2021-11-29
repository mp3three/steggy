import {
  LIGHTING_MODE,
  LightingCacheDTO,
  RoomEntitySaveStateDTO,
} from '@ccontour/controller-logic';
import { HASS_DOMAINS, LightStateDTO } from '@ccontour/home-assistant';
import { ColorsService, ICONS, PromptEntry } from '@ccontour/tty';
import { Inject, Injectable } from '@nestjs/common';

import { SwitchService } from './switch.service';

const START = 0;
const OFF = 0;
const R = 0;
const G = 1;
const B = 1;
const SHIFT_AMOUNT = 2;

@Injectable()
export class LightService extends SwitchService {
  @Inject()
  private readonly colorService: ColorsService;

  public async circadianLight(id: string): Promise<void> {
    return await this.fetchService.fetch({
      method: 'put',
      url: `/entity/command/${id}/circadianLight`,
    });
  }

  public async createSaveCommand(
    entity_id: string,
    current: Partial<RoomEntitySaveStateDTO<LightingCacheDTO>> = {},
  ): Promise<RoomEntitySaveStateDTO> {
    let defaultValue: string;
    if (typeof current.state !== 'undefined') {
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
    current.extra ??= {};
    current.extra.mode =
      state === 'circadian' ? LIGHTING_MODE.circadian : LIGHTING_MODE.on;
    if (
      typeof current?.extra?.brightness !== 'undefined' ||
      (await this.promptService.confirm(`Set brightness?`))
    ) {
      current.extra.brightness = await this.promptService.brightness(
        current?.extra?.brightness,
      );
    }
    if (
      state !== 'circadian' &&
      (Array.isArray(current?.extra?.rgb_color) ||
        (await this.promptService.confirm(`Set color?`)))
    ) {
      const [r, g, b] = current?.extra?.rgb_color ?? [];
      const rgb = await this.colorService.buildRGB({ b, g, r });
      current.extra.rgb_color = [rgb.r, rgb.g, rgb.b];
    }
    return current as RoomEntitySaveStateDTO;
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
    const light = await this.baseHeader<LightStateDTO>(id);
    const action = await super.processId(id, command, true);
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
      case 'brightness':
        await this.setState(id, {
          brightness: await this.promptService.number(
            `Brightness (0-255)`,
            light.attributes.brightness,
          ),
        });
        return await this.processId(id, action);
      case 'color':
        light.attributes ??= {};
        light.attributes.rgb_color ??= [OFF, OFF, OFF];
        const { r, g, b } = await this.colorService.buildRGB({
          b: light.attributes.rgb_color[B],
          g: light.attributes.rgb_color[G],
          r: light.attributes.rgb_color[R],
        });
        await this.setState(id, {
          rgb_color: [r, g, b],
        });
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
  protected getMenuOptions(id: string): PromptEntry[] {
    const parent = super.getMenuOptions(id);
    return [
      ...parent.slice(START, SHIFT_AMOUNT),
      [`${ICONS.CIRCADIAN}Circadian Light`, 'circadianLight'],
      [`${ICONS.UP}Dim Up`, 'dimUp'],
      [`${ICONS.DOWN}Dim Down`, 'dimDown'],
      [`${ICONS.COLOR}Set Color`, 'color'],
      [`${ICONS.BRIGHTNESS}Set Brightness`, 'brightness'],
      [`${ICONS.SWAP}Swap state with another light`, 'swapState'],
      ...parent.slice(SHIFT_AMOUNT),
    ];
  }

  protected logAttributes(states: LightStateDTO[]): unknown[] {
    return states.map((i) => ({
      color_mode: i.attributes?.color_mode ?? '',
      date: i.last_changed,
      rgb_color: (i.attributes?.rgb_color ?? [OFF, OFF, OFF]).join(', '),
      state: i.state,
    }));
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
