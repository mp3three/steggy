import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  InjectConfig,
  InjectLogger,
  OnEvent,
} from '@steggy/boilerplate';
import {
  CIRCADIAN_UPDATE,
  GeneralSaveStateDTO,
  LIGHT_FORCE_CIRCADIAN,
  RoomCommandDTO,
} from '@steggy/controller-shared';
import {
  EntityManagerService,
  HomeAssistantCoreService,
  LightDomainService,
} from '@steggy/home-assistant';
import {
  ColorModes,
  domain,
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
  LightAttributesDTO,
  LightStateDTO,
} from '@steggy/home-assistant-shared';
import { DOWN, each, INVERT_VALUE, is, PERCENT, UP } from '@steggy/utilities';

import { MIN_BRIGHTNESS } from '../../config';
import { ENTITY_METADATA_UPDATED } from '../../typings';
import { MetadataService } from '../metadata.service';
import { CircadianService } from './circadian.service';

const DEFAULT_INCREMENT = 50;
const NO_BRIGHTNESS = 0;
const MAX_BRIGHTNESS = 255;
const CACHE_KEY = entity_id => `ACTIVE_CIRCADIAN:${entity_id}`;

/**
 * - State management for lights
 * - Forwards commands to light domain service
 * - Management of the light temperature for lights flagged as circadian mode
 */
@Injectable()
export class LightManagerService {
  constructor(
    private readonly entityManager: EntityManagerService,
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly hassCore: HomeAssistantCoreService,
    private readonly light: LightDomainService,
    @InjectLogger()
    private readonly logger: AutoLogService,
    private readonly circadian: CircadianService,
    @Inject(forwardRef(() => MetadataService))
    private readonly metadata: MetadataService,
    @InjectConfig(MIN_BRIGHTNESS) private readonly minBrightness: number,
  ) {}

  private FORCE_CIRCADIAN: string[] = [];

  /**
   * Flip a light entity into color_temp mode, optionally setting brightness also
   */
  public async circadianLight(
    entity_id: string | string[] = [],
    brightness?: number,
    waitForChange = false,
  ): Promise<void> {
    if (Array.isArray(entity_id)) {
      await each(entity_id, async id => {
        await this.circadianLight(id, brightness, waitForChange);
      });
      return;
    }
    await this.setAttributes(
      entity_id,
      {
        brightness,
        color_mode: ColorModes.color_temp,
        kelvin: this.circadian.CURRENT_LIGHT_TEMPERATURE,
      },
      waitForChange,
    );
  }

  public async dimDown(
    data: RoomCommandDTO = {},
    change: string[],
    waitForChange = false,
  ): Promise<void> {
    const { increment = DEFAULT_INCREMENT } = data;
    const lights = this.findDimmableLights(change);
    await each(lights, async (entity_id: string) => {
      await this.lightDim(entity_id, increment * INVERT_VALUE, waitForChange);
    });
  }

  public async dimUp(
    data: RoomCommandDTO = {},
    change: string[],
    waitForChange = false,
  ): Promise<void> {
    const { increment = DEFAULT_INCREMENT } = data;
    const lights = this.findDimmableLights(change);
    await each(lights, async (entity_id: string) => {
      await this.lightDim(entity_id, increment, waitForChange);
    });
  }

  public findDimmableLights(change: string[]): string[] {
    return this.entityManager
      .findByDomain('light')
      .map(({ entity_id }) => entity_id)
      .filter(id => change.includes(id));
  }

  /**
   * Brightness (as controlled by the dimmer) must remain in the 5-100% range
   *
   * To go under 5, turn off the light instead
   */

  public async lightDim(
    entity_id: string,
    amount: number,
    waitForChange = false,
  ): Promise<void> {
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
    return await this.setAttributes(entity_id, { brightness }, waitForChange);
  }

  // eslint-disable-next-line radar/cognitive-complexity
  public async setAttributes(
    entity_id: string | string[],
    attributes: Partial<LightAttributesDTO> = {},
    waitForChange = false,
  ): Promise<void> {
    if (attributes.kelvin && (attributes.hs_color || attributes.rgb_color)) {
      this.logger.warn(
        { entity_id, settings: attributes },
        `Both kelvin and hs color provided`,
      );
    }
    if (Array.isArray(entity_id)) {
      await each(
        entity_id,
        async id => await this.setAttributes(id, attributes),
      );
      return;
    }
    const current = this.entityManager.getEntity<LightStateDTO>(entity_id);
    // if the incoming mode is circadian
    // or there is no mode defined, and the current one is circadian
    if (
      attributes.color_mode === ColorModes.color_temp ||
      !is.undefined(attributes.kelvin) ||
      (is.undefined(attributes.rgb_color) &&
        current.attributes.color_mode === ColorModes.color_temp)
    ) {
      attributes.kelvin = this.circadian.CURRENT_LIGHT_TEMPERATURE;
      attributes.color_mode = ColorModes.color_temp;
      if (this.FORCE_CIRCADIAN.includes(entity_id)) {
        const current = await this.cache.get(CACHE_KEY(entity_id));
        if (!current) {
          this.logger.debug(`[FORCE_CIRCADIAN] {${entity_id}}`);
        }
        await this.cache.set(CACHE_KEY(entity_id), true);
      }
    } else {
      delete attributes.kelvin;
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
    // Send turn on request, wait for completion before finishing
    await this.light.turnOn(entity_id, attributes, waitForChange);
  }

  public async turnOff(
    entity_id: string | string[],
    waitForChange = false,
  ): Promise<void> {
    await each(
      Array.isArray(entity_id) ? entity_id : [entity_id],
      async id => await this.cache.del(CACHE_KEY(id)),
    );
    return await this.hassCore.turnOff(entity_id, waitForChange);
  }

  public async turnOn(
    entity_id: string | string[],
    settings: Partial<GeneralSaveStateDTO> = {},
    waitForChange = false,
  ): Promise<void> {
    return await this.setAttributes(entity_id, settings.extra, waitForChange);
  }

  @OnEvent(CIRCADIAN_UPDATE)
  protected async circadianLightingUpdate(color_temp: number): Promise<void> {
    const lights = await this.findCircadianLights();
    await this.setAttributes(
      lights.map(({ entity_id }) => entity_id),
      { kelvin: color_temp },
    );
  }

  protected async onModuleInit(): Promise<void> {
    await this.refreshForceList();
  }

  /**
   * Going from 'unavailable' to turned on, quickly update the temp to the current
   *
   * Used for when smart lights are combined with
   */
  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async quickTemperatureSet(
    event: HassEventDTO<string, LightAttributesDTO>,
  ): Promise<void> {
    const { entity_id, new_state, old_state } = event.data;
    if (domain(entity_id) !== 'light') {
      return;
    }
    if (!(is.empty(old_state?.state) || old_state.state === 'unavailable')) {
      return;
    }
    if (new_state.state !== 'on') {
      return;
    }
    const update =
      new_state.attributes.color_mode === ColorModes.color_temp ||
      this.FORCE_CIRCADIAN.includes(entity_id);
    if (!update) {
      return;
    }
    await this.circadianLight(entity_id);
  }

  private async findCircadianLights(): Promise<LightStateDTO[]> {
    const lights = this.entityManager.findByDomain<LightStateDTO>('light');
    const forceActive: string[] = [];
    await each(this.FORCE_CIRCADIAN, async id => {
      const entity = lights.find(({ entity_id }) => entity_id === id);
      if (entity?.state !== 'on') {
        return;
      }
      const isActive = (await this.cache.get(CACHE_KEY(id))) ?? false;
      if (isActive) {
        forceActive.push(id);
      }
    });
    return [
      ...lights.filter(
        ({ attributes, entity_id }) =>
          attributes.color_mode === ColorModes.color_temp ||
          forceActive.includes(entity_id),
      ),
    ];
  }

  @OnEvent(ENTITY_METADATA_UPDATED(LIGHT_FORCE_CIRCADIAN))
  private async refreshForceList(): Promise<void> {
    this.FORCE_CIRCADIAN = await this.metadata.findWithFlag(
      LIGHT_FORCE_CIRCADIAN,
    );
    if (is.empty(this.FORCE_CIRCADIAN)) {
      return;
    }
    this.logger.debug(`Force circadian list`);
    this.FORCE_CIRCADIAN.sort((a, b) => (a > b ? UP : DOWN)).forEach(i =>
      this.logger.debug(` - {${i}}`),
    );
  }
}
