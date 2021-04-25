import {
  HA_RAW_EVENT,
  HA_SOCKET_READY,
} from '@automagical/contracts/constants';
import {
  AreaDTO,
  FanSpeeds,
  HassDomains,
  HassEventDTO,
  HassEvents,
  HassServices,
  HassStateDTO,
  HomeAssistantRoomRokuDTO,
  PicoStates,
  RokuInputs,
} from '@automagical/contracts/home-assistant';
import { FetchService, HTTP_Methods } from '@automagical/fetch';
import { InjectLogger, sleep } from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
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

  private static TRACK_DOMAINS = [
    HassDomains.group,
    HassDomains.light,
    HassDomains.switch,
  ];

  // #endregion Static Properties

  // #region Object Properties

  private AREA_MAP: Map<string, HassStateDTO[]>;
  private CONTROLLER_MAP: Map<string, string>;
  private FAVORITE_TIMEOUT: Map<string, boolean>;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    private readonly fetchService: FetchService,
    private readonly entityService: EntityService,
    @InjectLogger(AreaService, 'home-assistant')
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
  public async areaReload(): Promise<void> {
    this.AREA_MAP = new Map();
    this.CONTROLLER_MAP = new Map();

    const [areaList, entities] = await Promise.all([
      this.socketService.getAreas(),
      this.socketService.getAllEntitities(),
    ]);

    areaList.forEach((area) => this.AREA_MAP.set(area.name, []));

    entities.forEach((entity) => {
      const domain = entity.entity_id.split('.')[0] as HassDomains;
      if (this.isController(entity)) {
        this.CONTROLLER_MAP.set(entity.entity_id, entity.attributes.area_name);
        return;
      }
      if (!AreaService.TRACK_DOMAINS.includes(domain)) {
        return;
      }
      if (!this.AREA_MAP.has(entity.attributes.area_name)) {
        return;
      }
      this.AREA_MAP.get(entity.attributes.area_name).push(entity);
    });
  }

  public async setFan(
    entityId: string,
    speed: FanSpeeds | 'up' | 'down',
  ): Promise<void> {
    this.logger.trace({ entityId, speed }, 'setFan');
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
   * At least on my devices, the first request doesn't always work.
   *
   * I think it might be because it's sleeping or something?
   * The double request method seems to work around
   */
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

  protected isController(entity: HassStateDTO): boolean {
    const [domain, name] = entity.entity_id.split('.') as [HassDomains, string];
    return domain === HassDomains.sensor && name.includes('pico');
  }

  protected async setFavoriteScene(areaName: string): Promise<void> {
    const area = this.AREA_MAP.get(areaName);
    return;
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
        this.logger.trace('GLOBAL_ON');
        // this.eventEmitter.emit(GLOBAL_ON);
        return;
      }
      if (state.state === PicoStates.off) {
        this.logger.trace('GLOBAL_OFF');
        // this.eventEmitter.emit(GLOBAL_OFF);
        return;
      }
      if (state.state === PicoStates.favorite) {
        return await this.setFavoriteScene(areaName);
      }
      this.logger.warn('up/down favorite not implemented');
      return;
    }
    this.FAVORITE_TIMEOUT.set(entityId, true);
    setTimeout(() => this.FAVORITE_TIMEOUT.delete(entityId), 1000);
    if (state.state === PicoStates.high) {
      return area.forEach(async (entity) => {
        await this.entityService.turnOn(entity.entity_id);
      });
    }
    if (state.state === PicoStates.off) {
      return area.forEach(async (entity) => {
        await this.entityService.turnOff(entity.entity_id);
      });
    }
    if (state.state === PicoStates.favorite) {
      return await this.setFavoriteScene(areaName);
    }
  }

  private async turnOff(entityId: string) {
    return await this.entityService.turnOff(entityId);
  }

  private async turnOn(entityId: string) {
    return await this.entityService.turnOn(entityId);
  }

  // #endregion Private Methods
}
