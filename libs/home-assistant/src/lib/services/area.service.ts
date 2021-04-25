import {
  HA_RAW_EVENT,
  HA_SOCKET_READY,
  LIB_HOME_ASSISTANT,
} from '@automagical/contracts/constants';
import {
  FanSpeeds,
  HassDomains,
  HassEventDTO,
  HassEvents,
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
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { EventEmitter2 } from 'eventemitter2';
import { PinoLogger } from 'nestjs-pino';
import { EntityService } from './entity.service';
import { SocketService } from './socket.service';

@Injectable()
export class AreaService {
  // #region Static Properties

  private static TRACK_DOMAINS = [HassDomains.light, HassDomains.switch];

  // #endregion Static Properties

  // #region Object Properties

  private AREA_MAP: Map<string, string[]>;
  private CONTROLLER_MAP: Map<string, string>;
  private FAVORITE_TIMEOUT = new Map<string, boolean>();

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
    this.CONTROLLER_MAP = new Map();

    const [areaList, entities, devices] = await Promise.all([
      this.socketService.getAreas(),
      this.socketService.listEntities(),
      this.socketService.listDevices(),
    ]);

    areaList.forEach((area) => this.AREA_MAP.set(area.area_id, []));

    entities.forEach((entity) => {
      const domain = entity.entity_id.split('.')[0] as HassDomains;
      if (this.isController(entity)) {
        this.CONTROLLER_MAP.set(entity.entity_id, entity.area_id);
        return;
      }
      if (!AreaService.TRACK_DOMAINS.includes(domain)) {
        return;
      }
      let areaId = entity.area_id;
      if (!areaId) {
        areaId = devices.find((device) => device.id === entity.device_id)
          .area_id;
      }
      if (!areaId) {
        return;
      }
      const list = [...this.AREA_MAP.get(areaId), entity.entity_id];
      this.AREA_MAP.set(areaId, list);
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

  @Trace()
  public async setFavoriteScene(areaName: string): Promise<void> {
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
    area.forEach(async (entityId) => {
      await this.entityService.turnOn(entityId);
    });
  }

  /**
   * At least on my devices, the first request doesn't always work.
   *
   * I think it might be because it's sleeping or something?
   * The double request method seems to work around
   */
  @Trace()
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

  @OnEvent([HA_RAW_EVENT])
  private async onControllerEvent(event: HassEventDTO): Promise<void> {
    if (event.event_type !== HassEvents.state_changed) {
      return;
    }
    const entityId = event.data.entity_id;
    if (!this.CONTROLLER_MAP.has(entityId)) {
      return;
    }
    const areaName = this.CONTROLLER_MAP.get(entityId);
    const area = this.AREA_MAP.get(areaName);
    const state = event.data.new_state;
    if (state.state === PicoStates.none) {
      return;
    }
    if (this.FAVORITE_TIMEOUT.has(entityId)) {
      this.FAVORITE_TIMEOUT.delete(entityId);
      if (state.state === PicoStates.high) {
        this.logger.debug('GLOBAL_ON');
        // this.eventEmitter.emit(GLOBAL_ON);
        return;
      }
      if (state.state === PicoStates.off) {
        this.logger.debug('GLOBAL_OFF');
        // this.eventEmitter.emit(GLOBAL_OFF);
        return;
      }
      if (state.state === PicoStates.favorite) {
        return await this.setFavoriteScene(areaName);
      }
      if (state.state === PicoStates.medium) {
        this.logger.debug({ areaName }, 'up');
        return await this.lightDim(areaName, 10);
      }
      if (state.state === PicoStates.low) {
        this.logger.debug({ areaName }, 'down');
        return await this.lightDim(areaName, -10);
      }
      return;
    }
    if (state.state === PicoStates.high) {
      return area.forEach(async (entityId) => {
        await this.entityService.turnOn(entityId);
      });
    }
    if (state.state === PicoStates.off) {
      return area.forEach(async (entityId) => {
        await this.entityService.turnOff(entityId);
      });
    }
    if (state.state === PicoStates.favorite) {
      this.FAVORITE_TIMEOUT.set(entityId, true);
      setTimeout(() => this.FAVORITE_TIMEOUT.delete(entityId), 5000);
      return await this.setFavoriteScene(areaName);
    }
    if (state.state === PicoStates.medium) {
      this.logger.debug({ areaName }, 'up');
      return await this.lightDim(areaName, 10);
    }
    if (state.state === PicoStates.low) {
      this.logger.debug({ areaName }, 'down');
      return await this.lightDim(areaName, -10);
    }
  }

  @Trace()
  private async lightDim(areaName: string, amount: number) {
    const area = this.AREA_MAP.get(areaName);
    area.forEach(async (entityId) => {
      if (entityId.split('.')[0] === HassDomains.switch) {
        return;
      }
      await this.entityService.lightDim(entityId, amount);
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

  // #endregion Private Methods
}
