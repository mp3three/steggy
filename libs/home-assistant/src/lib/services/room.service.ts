import {
  CircadianModes,
  FanSpeeds,
  HassDomains,
  HassServices,
  HomeAssistantRoomConfigDTO,
  HomeAssistantRoomModeDTO,
  HomeAssistantRoomRokuDTO,
  RokuInputs,
  RoomModes,
  RoomScene,
} from '@automagical/contracts/home-assistant';
import { FetchService, HTTP_Methods } from '@automagical/fetch';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { sleep } from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { EventEmitter2 } from 'eventemitter2';
import SolarCalc from 'solar-calc';
import SolarCalcType from 'solar-calc/types/solarCalc';
import { EntityService } from './entity.service';
import { SocketService } from './socket.service';

@Injectable()
export class RoomService {
  // #region Object Properties

  public readonly ROOM_REGISTRY: Record<
    string,
    HomeAssistantRoomConfigDTO
  > = {};

  // Near Austin, TX... I think. Deleted a few digits
  private _SOLAR_CALC = null;

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
      now.isAfter(this.SOLAR_CALC.goldenHourStart) ||
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
    return new SolarCalc(
      new Date(),
      Number(process.env.LAT),
      Number(process.env.LONG),
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
    this.logger.debug(`setScene ${room.name}/${scene}`, accessories);
    const setMode = this.IS_EVENING ? RoomModes.evening : RoomModes.day;
    const mode: HomeAssistantRoomModeDTO = room[scene];
    this.eventEmitter.emit(`${room.name}/${scene}`);
    if (CircadianModes[scene]) {
      this.eventEmitter.emit('room/circadian', scene, room.name);
    }
    if (accessories) {
      mode?.all?.acc?.forEach((entityId) => {
        if (this.IS_EVENING || scene === RoomScene.off) {
          return this.entityService.turnOff(entityId, room.groups);
        }
        return this.entityService.turnOn(entityId, room.groups);
      });
    }
    mode?.all?.off?.forEach((entityId) =>
      this.entityService.turnOff(entityId, room.groups),
    );
    mode?.all?.on?.forEach((entityId) =>
      this.entityService.turnOn(entityId, room.groups),
    );
    const lightingNode = mode[setMode];
    if (!lightingNode) {
      if (!mode?.all) {
        this.logger.debug(`No lighting mode`, setMode);
      }
      return;
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
    if (!tempEntity) {
      this.logger.warn(`Could not find entity: ${room.config.temperature}`);
    }
    if ((tempEntity.state as number) > 74) {
      this.entityService.turnOn(fan);
    }
  }

  public async smart(
    room: HomeAssistantRoomConfigDTO,
    target: RoomScene = this.IS_EVENING ? RoomScene.medium : RoomScene.high,
  ): Promise<void> {
    room = room || ({ name: null } as HomeAssistantRoomConfigDTO);
    let altScene: RoomScene = RoomScene.high;
    if (target === RoomScene.off || this.IS_EVENING) {
      altScene = RoomScene.off;
    }
    this.logger.debug('altScene', altScene);
    Object.values(this.ROOM_REGISTRY)
      .filter((i) => i.name !== room.name)
      .forEach((otherRoom) => this.setScene(altScene, otherRoom, true));
    if (room.name === null) {
      return;
    }
    return this.setScene(target, room, true);
  }

  // #endregion Public Methods
}
