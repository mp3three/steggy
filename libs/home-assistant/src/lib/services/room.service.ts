import {
  FanSpeeds,
  HassDomains,
  HassServices,
  HomeAssistantRoomConfigDTO,
  HomeAssistantRoomRokuDTO,
  RokuInputs,
} from '@automagical/contracts/home-assistant';
import { FetchService, HTTP_Methods } from '@automagical/fetch';
import { sleep } from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { EventEmitter2 } from 'eventemitter2';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EntityService } from './entity.service';
import { SocketService } from './socket.service';

@Injectable()
export class RoomService {
  // #region Object Properties

  public readonly ROOM_REGISTRY: Record<
    string,
    HomeAssistantRoomConfigDTO
  > = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    private readonly fetchService: FetchService,
    private readonly entityService: EntityService,
    @InjectPinoLogger(RoomService.name) protected readonly logger: PinoLogger,
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

  public async setFan(
    entityId: string,
    speed: FanSpeeds | 'up' | 'down',
  ): Promise<void> {
    this.logger.debug(entityId, speed);
    const fan = await this.entityService.byId(entityId);
    const attributes = fan.attributes as { speed: FanSpeeds };
    if (speed === 'up') {
      return this.entityService.fanSpeedUp(attributes.speed, entityId);
    }
    if (speed === 'down') {
      return this.entityService.fanSpeedDown(attributes.speed, entityId);
    }
    return this.socketService.call(HassDomains.fan, HassServices.turn_on, {
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
    this.cacheService.set(roku.host, channel, {
      ttl: 60 * 60,
    });
    // Because fuck working the first time you ask for something
    if (channel === 'off') {
      await this.fetchService.fetch({
        url: '/keypress/PowerOff',
        method: HTTP_Methods.POST,
        baseUrl: roku.host,
        process: false,
      });
      await sleep(100);
      return this.fetchService.fetch({
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
    return this.fetchService.fetch({
      url: `/launch/${input}`,
      method: HTTP_Methods.POST,
      baseUrl: roku.host,
      process: false,
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private turnOff(
    entityId: string,
    groupData: Map<string, string[]> = new Map(),
  ) {
    this.entityService.turnOff(entityId, groupData);
  }

  private turnOn(
    entityId: string,
    groupData: Map<string, string[]> = new Map(),
  ) {
    this.entityService.turnOn(entityId, groupData);
  }

  // #endregion Private Methods
}
