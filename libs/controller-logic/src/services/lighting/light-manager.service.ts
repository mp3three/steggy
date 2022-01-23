import { Injectable } from '@nestjs/common';
import {
  AutoLogService,
  InjectConfig,
  InjectLogger,
} from '@text-based/boilerplate';
import {
  CIRCADIAN_UPDATE,
  RoomCommandDTO,
} from '@text-based/controller-shared';
import {
  EntityManagerService,
  HomeAssistantCoreService,
  LightDomainService,
} from '@text-based/home-assistant';
import {
  ColorModes,
  HASS_DOMAINS,
  LightAttributesDTO,
  LightStateDTO,
} from '@text-based/home-assistant-shared';
import { each, INVERT_VALUE, is, PERCENT } from '@text-based/utilities';
import EventEmitter from 'eventemitter3';

import { MIN_BRIGHTNESS } from '../../config';
import { CircadianService } from './circadian.service';

const DEFAULT_INCREMENT = 50;
const NO_BRIGHTNESS = 0;
const MAX_BRIGHTNESS = 255;

/**
 * - State management for lights
 * - Forwards commands to light domain service
 * - Management of the light temperature for lights flagged as circadian mode
 */
@Injectable()
export class LightManagerService {
  constructor(
    private readonly entityManager: EntityManagerService,
    private readonly hassCoreService: HomeAssistantCoreService,
    private readonly lightService: LightDomainService,
    @InjectLogger()
    private readonly logger: AutoLogService,
    private readonly circadianService: CircadianService,
    private readonly eventEmitter: EventEmitter,
    @InjectConfig(MIN_BRIGHTNESS) private readonly minBrightness: number,
  ) {}

  /**
   * Flip a light entity into color_temp mode, optionally setting brightness also
   */
  public async circadianLight(
    entity_id: string | string[] = [],
    brightness?: number,
  ): Promise<void> {
    if (Array.isArray(entity_id)) {
      await each(entity_id, async id => {
        await this.circadianLight(id, brightness);
      });
      return;
    }
    await this.setAttributes(entity_id, {
      brightness,
      color_mode: ColorModes.color_temp,
    });
  }

  public async dimDown(
    data: RoomCommandDTO = {},
    change: string[],
  ): Promise<void> {
    const { increment = DEFAULT_INCREMENT } = data;
    const lights = this.findDimmableLights(change);
    await each(lights, async (entity_id: string) => {
      await this.lightDim(entity_id, increment * INVERT_VALUE);
    });
  }

  public async dimUp(
    data: RoomCommandDTO = {},
    change: string[],
  ): Promise<void> {
    const { increment = DEFAULT_INCREMENT } = data;
    const lights = this.findDimmableLights(change);
    await each(lights, async (entity_id: string) => {
      await this.lightDim(entity_id, increment);
    });
  }

  public findDimmableLights(change: string[]): string[] {
    return this.entityManager
      .findByDomain(HASS_DOMAINS.light)
      .map(({ entity_id }) => entity_id)
      .filter(id => change.includes(id));
  }

  /**
   * Brightness (as controlled by the dimmer) must remain in the 5-100% range
   *
   * To go under 5, turn off the light instead
   */

  public async lightDim(entity_id: string, amount: number): Promise<void> {
    const entity = this.entityManager.getEntity<LightStateDTO>(entity_id);
    let { brightness = NO_BRIGHTNESS } = entity.attributes;
    brightness += amount;
    if (brightness > MAX_BRIGHTNESS) {
      brightness = MAX_BRIGHTNESS;
    }
    if (brightness < this.minBrightness) {
      brightness = this.minBrightness;
    }
    this.logger.debug(
      { amount },
      `[${entity_id}] set brightness: {${brightness}/${MAX_BRIGHTNESS} (${Math.floor(
        (brightness * PERCENT) / MAX_BRIGHTNESS,
      )}%)}`,
    );
    return await this.setAttributes(entity_id, { brightness });
  }

  public async setAttributes(
    entity_id: string | string[],
    attributes: Partial<LightAttributesDTO> = {},
  ): Promise<void> {
    if (attributes.kelvin && (attributes.hs_color || attributes.rgb_color)) {
      this.logger.warn(
        { entity_id, settings: attributes },
        `Both kelvin and hs color provided`,
      );
    }
    if (Array.isArray(entity_id)) {
      await each(entity_id, async id => {
        await this.setAttributes(id, attributes);
      });
      return;
    }
    const current = this.entityManager.getEntity<LightStateDTO>(entity_id);
    // if the incoming mode is circadian
    // or there is no mode defined, and the current one is circadian
    if (
      attributes.color_mode === ColorModes.color_temp ||
      (is.empty(attributes.color_mode) &&
        current.attributes.color_mode === ColorModes.color_temp)
    ) {
      attributes.kelvin = this.circadianService.CURRENT_LIGHT_TEMPERATURE;
      attributes.color_mode = ColorModes.color_temp;
    } else {
      delete attributes.kelvin;
      // attributes.color_mode = ColorModes.hs;
      // attributes.rgb_color = current.attributes.rgb_color;
      if (
        is.undefined(attributes.rgb_color) &&
        is.undefined(attributes.brightness)
      ) {
        // Just a standard "turn on", possibly a transition from circadian => color
        attributes.hs_color = current.attributes.hs_color;
      }
    }
    Object.keys(attributes).forEach(key => {
      if (is.undefined(attributes[key])) {
        delete attributes[key];
      }
    });
    delete attributes.color_mode;
    this.logger.warn({ attributes }, entity_id);
    await this.lightService.turnOn(entity_id, attributes);
  }

  public async turnOff(entity_id: string | string[]): Promise<void> {
    return this.hassCoreService.turnOff(entity_id);
  }

  public async turnOn(
    entity_id: string | string[],
    settings: Partial<LightAttributesDTO> = {},
  ): Promise<void> {
    return this.setAttributes(entity_id, {
      ...settings,
      color_mode: ColorModes.hs,
    });
  }

  protected async circadianLightingUpdate(color_temp: number): Promise<void> {
    const lights = this.entityManager
      .findByDomain<LightStateDTO>(HASS_DOMAINS.light)
      .filter(
        ({ attributes }) => attributes.color_mode === ColorModes.color_temp,
      );
    await this.setAttributes(
      lights.map(({ entity_id }) => entity_id),
      { kelvin: color_temp },
    );
  }

  protected onModuleInit(): void {
    this.eventEmitter.on(CIRCADIAN_UPDATE, kelvin =>
      this.circadianLightingUpdate(kelvin),
    );
  }
}
