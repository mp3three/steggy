import {
  HA_EVENT_STATE_CHANGE,
  HA_SOCKET_READY,
  LIB_HOME_ASSISTANT,
} from '@automagical/contracts/constants';
import {
  AreaFlags,
  domain,
  FanSpeeds,
  HassDomains,
  HassEventDTO,
  HassServices,
  HomeAssistantRoomRokuDTO,
  PicoStates,
  RokuInputs,
} from '@automagical/contracts/home-assistant';
import { FetchService, HTTP_Methods } from '@automagical/fetch';
import { InjectLogger, sleep, Trace } from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { EventEmitter2 } from 'eventemitter2';
import { PinoLogger } from 'nestjs-pino';
import { EntityService } from './entity.service';
import { SocketService } from './socket.service';

@Injectable()
export class AreaService {
  // #region Static Properties

  private static TRACK_DOMAINS = [
    HassDomains.light,
    HassDomains.switch,
    HassDomains.remote,
  ];

  // #endregion Static Properties

  // #region Object Properties

  /**
   * Populated by using input_boolean entities
   *
   * Created via configuration.yaml, feature flag added in customize.yaml
   *
   * Would really like to be able to add attributes to areas, this is a headache
   */
  private AREA_FLAGS: Map<string, AreaFlags[]>;
  private AREA_MAP: Map<string, string[]>;
  private CONTROLLER_MAP: Map<string, string>;
  private FAVORITE_TIMEOUT = new Map<string, PicoStates>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    private readonly fetchService: FetchService,
    private readonly configService: ConfigService,
    private readonly entityService: EntityService,
    @InjectLogger(AreaService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly socketService: SocketService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Accessors

  public get IS_EVENING(): boolean {
    // For the purpose of the house, it's considered evening if the sun has set, or it's past 6PM
    const now = dayjs();
    return (
      now.isAfter(this.entityService.SOLAR_CALC.goldenHourStart) ||
      now.isAfter(now.startOf('day').add(12 + 6, 'hour')) ||
      now.isBefore(this.entityService.SOLAR_CALC.sunrise)
    );
  }

  // #endregion Public Accessors

  // #region Public Methods

  @OnEvent([HA_SOCKET_READY])
  @Trace()
  public async areaReload(): Promise<void> {
    this.AREA_MAP = new Map();
    this.AREA_FLAGS = new Map();
    this.CONTROLLER_MAP = new Map();

    const [areaList, entities, devices] = await Promise.all([
      this.socketService.getAreas(),
      this.socketService.listEntities(),
      this.socketService.listDevices(),
    ]);

    areaList.forEach((area) => this.AREA_MAP.set(area.area_id, []));

    entities.forEach((entity) => {
      const entityId = entity.entity_id;
      let areaId = entity.area_id;
      if (this.isController(entity)) {
        this.CONTROLLER_MAP.set(entityId, areaId);
        return;
      }
      if (!AreaService.TRACK_DOMAINS.includes(domain(entity))) {
        return;
      }
      if (!areaId && entity.device_id) {
        areaId = devices.find((device) => device.id === entity.device_id)
          .area_id;
      }
      if (!areaId) {
        return;
      }
      const list = this.AREA_MAP.get(areaId) || [];
      list.push(entityId);
      this.AREA_MAP.set(areaId, list);
    });

    entities.forEach(async (entity) => {
      if (domain(entity) !== HassDomains.input_boolean) {
        return;
      }
      const entityId = entity.entity_id;
      const state = await this.entityService.byId(entityId);
      if (state.state !== 'on') {
        return;
      }
      const customizations = await this.socketService.fetchEntityCustomizations(
        entityId,
      );
      const feature = customizations.local.feature as AreaFlags;
      const area: string = entity.area_id;
      const flags = this.AREA_FLAGS.get(area) || [];
      flags.push(feature);
      this.AREA_FLAGS.set(area, flags);
    });
  }

  @Trace()
  public async areaOff(areaName: string): Promise<void> {
    const area = this.AREA_MAP.get(areaName);
    area.forEach(async (entityId) => {
      await this.entityService.turnOff(entityId);
    });
  }

  @Trace()
  public async areaOn(areaName: string): Promise<void> {
    const area = this.AREA_MAP.get(areaName);
    area.forEach(async (entityId) => {
      if (domain(entityId) === HassDomains.remote) {
        return;
      }
      await this.entityService.turnOn(entityId);
    });
  }

  @Trace()
  public async globalOff(areaName?: string): Promise<void> {
    if (!this.isCommonArea(areaName)) {
      return await this.areaOff(areaName);
    }
    this.getCommonAreas().forEach(async (areaName) => {
      await this.areaOff(areaName);
    });
  }

  @Trace()
  public async globalOn(areaName?: string): Promise<void> {
    if (!this.isCommonArea(areaName)) {
      return await this.areaOff(areaName);
    }
    this.getCommonAreas().forEach(async (areaName) => {
      await this.areaOn(areaName);
    });
  }

  @Trace()
  public async setFan(
    entityId: string,
    speed: FanSpeeds | 'up' | 'down',
  ): Promise<void> {
    const fan = await this.entityService.byId(entityId);
    const attributes = fan.attributes as { speed: FanSpeeds };
    if (speed === 'up') {
      return await this.entityService.fanSpeedUp(attributes.speed, entityId);
    }
    if (speed === 'down') {
      return await this.entityService.fanSpeedDown(attributes.speed, entityId);
    }
    return await this.socketService.call(HassServices.turn_on, {
      entity_id: entityId,
      speed: speed,
    });
  }

  /**
   * General "turn stuff on, but maybe not all the way" function
   *
   * ## Scene
   * TODO: Currently, it loads the scene via config service.
   * This would be better done with a HA yaml scene
   *
   * ## Smart turn on
   * If there are switches in the room (smart switches tied to lights). Turn only those on
   *
   * If there are no switches, act the same as the "turn on" button.
   *
   * ## Common area
   *
   * If the 2nd argument (global) is set to true, then attempt to communicate with other areas.
   * If this area is flagged as a common area (like the living room), then relay the request to other common areas
   *
   * This is intended for use primarily in the evenings, where one might want to turn off all the non-bedroom lights, and watch a movie or something.
   * Since my place is particularly dark during the day, this will also act as a "turn on all the common areas" during the day
   *
   * ## Expansions
   *
   * Automatically turn on the tv if registered with the area
   * Emit events that can be picked up by the application
   */
  @Trace()
  public async setFavoriteScene(
    areaName: string,
    global = false,
  ): Promise<void> {
    if (global && this.isCommonArea(areaName)) {
      this.getCommonAreas().forEach(async (name) => {
        if (this.IS_EVENING) {
          this.logger.info(name);
          return await this.areaOff(name);
        }
        await this.areaOn(areaName);
      });
      // Double press favorite = turn on all things controlled by remote for the room
      // Like a TV
      this.AREA_MAP.get(areaName).forEach(async (entityId) => {
        if (domain(entityId) !== HassDomains.remote) {
          return;
        }
        await this.entityService.turnOn(entityId);
      });
      return;
    }
    const scene = this.configService.get(`favorites.${areaName}`) as Record<
      'day' | 'evening',
      Record<'on' | 'off', string[]>
    >;
    if (scene) {
      const part = this.IS_EVENING ? scene.evening : scene.day;
      part?.on?.forEach(async (entityId) => {
        await this.entityService.turnOn(entityId);
      });
      part?.off?.forEach(async (entityId) => {
        await this.entityService.turnOff(entityId);
      });
      return;
    }
    const area = this.AREA_MAP.get(areaName);
    let containsSwitches = false;
    area.forEach(async (entityId) => {
      if (domain(entityId) !== HassDomains.switch) {
        return;
      }
      containsSwitches = true;
      await this.entityService.turnOn(entityId);
    });
    if (!containsSwitches) {
      await this.areaOn(areaName);
    }
  }

  /**
   * At least on my devices, the first request doesn't always work.
   *
   * I think it might be because it's sleeping or something?
   * The double request method seems to work around
   */
  @Trace({ level: 'debug' })
  public async setRoku(
    channel: RokuInputs | string,
    roku: HomeAssistantRoomRokuDTO,
  ): Promise<void> {
    const currentChannel = await this.cacheService.get(roku.host);
    this.logger.info(`setRoku (${roku.host}) ${currentChannel} => ${channel}`);
    if (currentChannel === channel) {
      return;
    }
    await this.cacheService.set(roku.host, channel);
    // Because fuck working the first time you ask for something
    if (channel === 'off') {
      await this.fetchService.fetch({
        url: '/keypress/PowerOff',
        method: HTTP_Methods.POST,
        baseUrl: roku.host,
        process: false,
      });
      await sleep(100);
      return await this.fetchService.fetch({
        url: '/keypress/PowerOff',
        method: HTTP_Methods.POST,
        baseUrl: roku.host,
        process: false,
      });
    }
    let input = channel as string;
    if (channel.substr(0, 4) === 'hdmi') {
      input = `tvinput.${channel}`;
    }
    await this.fetchService.fetch({
      url: `/launch/${input}`,
      method: HTTP_Methods.POST,
      baseUrl: roku.host,
      process: false,
    });
    await sleep(100);
    return await this.fetchService.fetch({
      url: `/launch/${input}`,
      method: HTTP_Methods.POST,
      baseUrl: roku.host,
      process: false,
    });
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected isController(entity: { entity_id: string }): boolean {
    const [domain, name] = entity.entity_id.split('.') as [HassDomains, string];
    return domain === HassDomains.sensor && name.includes('pico');
  }

  // #endregion Protected Methods

  // #region Private Methods

  // @Cron('*/5 * * * * *')
  @Cron('0 */5 * * * *')
  @Trace({ omitArgs: true, level: 'info' })
  private async circadianLightingUpdate() {
    this.AREA_MAP.forEach((entities) => {
      entities.forEach(async (entityId) => {
        if (domain(entityId) !== HassDomains.light) {
          return;
        }
        const entity = await this.entityService.byId(entityId);
        if (entity.state !== 'on') {
          return;
        }
        await this.entityService.circadianLight(entityId);
      });
    });
  }

  @OnEvent([HA_EVENT_STATE_CHANGE])
  private async onControllerEvent(event: HassEventDTO): Promise<void> {
    const entityId = event.data.entity_id;
    if (!this.CONTROLLER_MAP.has(entityId)) {
      return;
    }
    const areaName = this.CONTROLLER_MAP.get(entityId);
    const state = event.data.new_state;
    this.logger.info({ state, entityId }, `Controller state updated`);
    if (state.state === PicoStates.none) {
      return;
    }
    if (this.FAVORITE_TIMEOUT.get(entityId) === state.state) {
      this.FAVORITE_TIMEOUT.delete(entityId);
      switch (state.state) {
        case PicoStates.on:
          return await this.setCommon(true);
        case PicoStates.off:
          return await this.setCommon(false);
        case PicoStates.up:
          return await this.lightDim(areaName, 10);
        case PicoStates.down:
          return await this.lightDim(areaName, -10);
        case PicoStates.favorite:
          return await this.setFavoriteScene(areaName, true);
      }
      this.logger.error({ state }, 'Unknown button');
      return;
    }
    this.FAVORITE_TIMEOUT.set(entityId, state.state as PicoStates);
    switch (state.state) {
      case PicoStates.on:
        return await this.areaOn(areaName);
      case PicoStates.off:
        return await this.areaOff(areaName);
      case PicoStates.up:
        return await this.lightDim(areaName, 10);
      case PicoStates.down:
        return await this.lightDim(areaName, -10);
      case PicoStates.favorite:
        setTimeout(
          () => this.FAVORITE_TIMEOUT.delete(entityId),
          this.configService.get('libs.home-assistant.DBL_CLICK_TIMEOUT') ||
            1000,
        );
        return await this.setFavoriteScene(areaName);
    }
  }

  @Trace()
  private async lightDim(areaName: string, amount: number) {
    const area = this.AREA_MAP.get(areaName);
    area.forEach(async (entityId) => {
      if (domain(entityId) !== HassDomains.light) {
        return;
      }
      const entity = await this.entityService.byId(entityId);
      if (entity.state === 'off') {
        return;
      }
      await this.entityService.lightDim(entityId, amount);
    });
  }

  @Trace()
  private async setCommon(state: boolean) {
    this.getCommonAreas().forEach(async (areaName) => {
      if (state) {
        return await this.areaOn(areaName);
      }
      await this.areaOff(areaName);
    });
  }

  @Trace()
  private async turnOff(entityId: string) {
    return await this.entityService.turnOff(entityId);
  }

  @Trace()
  private async turnOn(entityId: string) {
    return await this.entityService.turnOn(entityId);
  }

  private getCommonAreas(): string[] {
    const out = [];
    this.AREA_FLAGS.forEach((flags, area) => {
      if (flags.includes(AreaFlags.COMMON_AREA)) {
        out.push(area);
      }
    });
    return out;
  }

  private isCommonArea(areaName): boolean {
    const flags = this.AREA_FLAGS.get(areaName);
    return flags.includes(AreaFlags.COMMON_AREA);
  }

  // #endregion Private Methods
}
