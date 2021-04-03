import { HA_ALL_CONFIGS } from '@automagical/contracts/constants';
import {
  CircadianModes,
  FanSpeeds,
  HassDomains,
  HassServices,
  HomeAssistantRoomCircadianDTO,
  HomeAssistantRoomConfigDTO,
  HomeAssistantRoomModeDTO,
  HomeAssistantRoomRokuDTO,
  RokuInputs,
  RoomModes,
  RoomScene,
} from '@automagical/contracts/home-assistant';
import { Fetch, HTTP_Methods } from '@automagical/fetch';
import { Logger } from '@automagical/logger';
import { sleep } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';
import { EventEmitter2 } from 'eventemitter2';
import * as SolarCalc from 'solar-calc';
import SolarCalcType from 'solar-calc/types/solarCalc';
import { EntityService } from './entity.service';
import { SocketService } from './socket.service';

@Injectable()
export class RoomService {
  // #region Object Properties

  // Near Austin, TX... I think. Deleted a few digits
  private readonly logger = Logger(RoomService);

  private _SOLAR_CALC = null;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(HA_ALL_CONFIGS)
    private readonly ALL_CONFIGS: HomeAssistantRoomConfigDTO[],
    private readonly cacheService: Cache,
    private readonly entityService: EntityService,
    private readonly socketService: SocketService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Accessors

  public get IS_EVENING(): boolean {
    // For the purpose of the house, it's considered evening if the sun has set, or it's past 6PM

    const now = dayjs();
    return (
      now.isAfter(this.SOLAR_CALC.sunset) ||
      now.isAfter(now.startOf('day').add(12 + 6, 'hour')) ||
      now.isBefore(this.SOLAR_CALC.sunrise)
    );
  }

  public get SOLAR_CALC(): SolarCalcType {
    if (this._SOLAR_CALC) {
      return this._SOLAR_CALC;
    }
    setTimeout(() => (this._SOLAR_CALC = null), 1000 * 30);
    // typescript is wrong this time, it works as expected for me
    // eslint-disable-next-line
    // @ts-ignore
    return new SolarCalc(new Date(), RoomService.LAT, RoomService.LONG);
  }

  // #endregion Public Accessors

  // #region Public Methods

  public async setCircadian(
    mode: CircadianModes,
    config: HomeAssistantRoomCircadianDTO,
  ): Promise<void> {
    switch (mode) {
      case CircadianModes.high:
        this.entityService.turnOff(config.low);
        this.entityService.turnOff(config.medium);
        this.entityService.turnOn(config.high);
        return;
      case CircadianModes.medium:
        this.entityService.turnOff(config.low);
        this.entityService.turnOff(config.high);
        this.entityService.turnOn(config.medium);
        return;
      case CircadianModes.low:
        this.entityService.turnOff(config.high);
        this.entityService.turnOff(config.medium);
        this.entityService.turnOn(config.low);
        return;
      case CircadianModes.off:
        this.entityService.turnOff(config.low);
        this.entityService.turnOff(config.medium);
        this.entityService.turnOff(config.high);
        return;
    }
  }

  public async setFan(
    entityId: string,
    speed: FanSpeeds | 'up' | 'down',
  ): Promise<void> {
    const fan = await this.entityService.byId(entityId);
    if (speed === 'up') {
      return this.entityService.fanSpeedUp(fan.state as FanSpeeds, entityId);
    }
    if (speed === 'down') {
      return this.entityService.fanSpeedDown(fan.state as FanSpeeds, entityId);
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
    this.logger.info(`setRoku`, channel);
    const currentChannel = await this.cacheService.get(roku.host);
    if (currentChannel === channel) {
      return;
    }
    this.cacheService.set(roku.host, channel, {
      ttl: 60 * 60,
    });
    // Because fuck working the first time you ask for something
    if (channel === 'off') {
      await Fetch.fetch({
        url: '/keypress/PowerOff',
        method: HTTP_Methods.POST,
        baseUrl: roku.host,
      });
      await sleep(100);
      return Fetch.fetch({
        url: '/keypress/PowerOff',
        method: HTTP_Methods.POST,
        baseUrl: roku.host,
      });
    }
    let input = channel as string;
    if (channel.substr(0, 4) === 'hdmi') {
      input = `tvinput.${channel}`;
    }
    await Fetch.fetch({
      url: `/launch/${input}`,
      method: HTTP_Methods.POST,
      baseUrl: roku.host,
    });
    await sleep(100);
    return Fetch.fetch({
      url: `/launch/${input}`,
      method: HTTP_Methods.POST,
      baseUrl: roku.host,
    });
  }

  /**
   * This works in conjunction with Caseta Pico remotes I use as light switches.
   * High / medium / low / off / "smart"/favorite
   *
   * - Pressing the high/medium/low/off should only affet the room as normal.
   * - Smart button says "Adjust all the lights in the house relative to time of day + button pushed"
   *   - During the day, things turn on more
   *   - During the evening/night, things turn off more
   *
   * - Set circadian lighting mode
   * - Turn on any listed entities
   * - Turn off any others
   * - If accessories:
   *   - If evening, turn off accessories
   *   - If daytime, turn on accessories
   *   - Lock the doors
   *   - If scene isn't "off", and the room is warm: turn on the ceiling fan
   */
  public async setScene(
    scene: RoomScene,
    room: HomeAssistantRoomConfigDTO,
    accessories = false,
  ): Promise<void> {
    const setMode = this.IS_EVENING ? RoomModes.evening : RoomModes.day;
    const mode: HomeAssistantRoomModeDTO = room[scene];
    this.eventEmitter.emit(`${room.name}/${scene}`);

    if (mode?.all?.circadian) {
      this.setCircadian(mode.all.circadian, room.config.circadian);
    }
    if (accessories) {
      mode?.all?.acc?.forEach((entityId) => {
        if (this.IS_EVENING) {
          return this.entityService.turnOff(entityId, room.groups);
        }
        return this.entityService.turnOn(entityId, room.groups);
      });
    }
    const lightingNode = mode[setMode];
    if (!lightingNode) {
      return;
    }
    if (lightingNode.circadian) {
      this.setCircadian(lightingNode.circadian, room.config.circadian);
    }
    lightingNode?.acc?.forEach((entityId) => {
      if (this.IS_EVENING) {
        return this.entityService.turnOff(entityId, room.groups);
      }
      return this.entityService.turnOn(entityId, room.groups);
    });
    lightingNode?.on?.forEach((entityId) =>
      this.entityService.turnOn(entityId, room.groups),
    );
    lightingNode?.off?.forEach((entityId) =>
      this.entityService.turnOff(entityId, room.groups),
    );
    const fan = room?.config?.fan;
    if (!fan || !accessories) {
      return;
    }
    const tempEntity = await this.entityService.byId(room.config.temperature);
    if ((tempEntity.state as number) > 74) {
      this.entityService.turnOn(fan);
    }
  }

  public async smart(
    room: HomeAssistantRoomConfigDTO,
    extra: HomeAssistantRoomConfigDTO[] = this.ALL_CONFIGS || [],
  ): Promise<void> {
    extra
      .filter((i) => i.name !== room.name)
      .forEach((otherRoom) => this.setScene(RoomScene.off, otherRoom, false));
    return this.setScene(
      this.IS_EVENING ? RoomScene.medium : RoomScene.high,
      room,
      true,
    );
  }

  // #endregion Public Methods
}
