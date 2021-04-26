import {
  ALL_ENTITIES_UPDATED,
  HA_RAW_EVENT,
  LIB_HOME_ASSISTANT,
} from '@automagical/contracts/constants';
import {
  domain,
  FanSpeeds,
  HassDomains,
  HassEventDTO,
  HassServices,
  HassStateDTO,
  HomeAssistantEntityAttributes,
} from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import dayjs, { Dayjs } from 'dayjs';
import { PinoLogger } from 'nestjs-pino';
import SolarCalc from 'solar-calc';
import SolarCalcType from 'solar-calc/types/solarCalc';
import { SocketService } from './socket.service';

const availableSpeeds = [
  FanSpeeds.off,
  FanSpeeds.low,
  FanSpeeds.medium,
  FanSpeeds.medium_high,
  FanSpeeds.high,
];

/**
 * ## Lights
 *
 * Right now, this service assumes that light.turnOn implies the lights should automatically go into a circadian lighting mode.
 * The color of the lights in this situatino are managed by the position of the sun relative to LAT/LONG provided to the application.
 *
 * Brightness is controlled via dimmer style controls. Turning on the light will make a best guess at a sane value for the current time.
 * If it's dark outside, default "turn on / high" is closer to 60%. During the daytime, this should be closer to 100%.
 * This number may include offsets in the future, so the "true brightness" as reported by Home Assistant could end up being different from a brightness target.
 *
 * **For example**: Animations may run through a range of brighnesses before settling into an end brightness. The end target is what will be cached
 *
 *
 * The cache service is brought in to store the intended brightness target. This way, the data can be persisted across restarts / processes easily.
 *
 * ## Dealing with desync
 *
 * Sometimes, devices aren't in the state that the code thinks they are.
 * This service should always treat a "turn off" command as a "reset your current state" type of command.
 *
 * **For example**: If anything is being cached, it should be deleted rather than be set to 0
 */
@Injectable()
export class EntityService {
  // #region Object Properties

  private readonly ENTITIES = new Map<string, HassStateDTO>();

  private _SOLAR_CALC = null;
  private lastUpdate: Dayjs;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(EntityService, LIB_HOME_ASSISTANT)
    protected readonly logger: PinoLogger,
    private readonly socketService: SocketService,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Accessors

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
      // TODO: Populated via home assistant
      Number(this.configService.get('application.LAT')),
      Number(this.configService.get('application.LONG')),
    );
  }

  // #endregion Public Accessors

  // #region Public Methods

  @Trace()
  public async fanSpeedDown(
    currentSpeed: FanSpeeds,
    entityId: string,
  ): Promise<void> {
    const idx = availableSpeeds.indexOf(currentSpeed);
    this.logger.debug(
      `fanSpeedDown ${entityId}: ${currentSpeed} => ${
        availableSpeeds[idx - 1]
      }`,
    );
    if (idx === 0) {
      this.logger.debug(`Cannot speed down`);
      return;
    }
    return await this.socketService.call(HassServices.turn_on, {
      entity_id: entityId,
      speed: availableSpeeds[idx - 1],
    });
  }

  @Trace()
  public async fanSpeedUp(
    currentSpeed: FanSpeeds,
    entityId: string,
  ): Promise<void> {
    const idx = availableSpeeds.indexOf(currentSpeed);
    this.logger.debug(
      `fanSpeedUp ${entityId}: ${currentSpeed} => ${availableSpeeds[idx + 1]}`,
    );
    if (idx === availableSpeeds.length - 1) {
      this.logger.debug(`Cannot speed up`);
      return;
    }
    return await this.socketService.call(HassServices.turn_on, {
      entity_id: entityId,
      speed: availableSpeeds[idx + 1],
    });
  }

  /**
   * Brightness (as controlled by the dimmer) must remain in the 5-100% range
   *
   * To go under 5, turn off the light instead
   */
  @Trace()
  public async lightDim(entityId: string, amount: number): Promise<void> {
    let brightness = await this.lightBrightness(entityId);
    brightness = brightness + amount;
    if (brightness > 100) {
      brightness = 100;
    }
    if (brightness < 5) {
      brightness = 5;
    }
    this.logger.debug({ amount }, `${entityId} set brightness: ${brightness}%`);
    return await this.circadianLight(entityId, brightness);
  }

  @Trace()
  public async toggle(entityId: string): Promise<void> {
    const entity = await this.byId(entityId);
    if (entity.state === 'on') {
      return await this.turnOff(entityId);
    }
    return await this.turnOn(entityId);
  }

  @Trace()
  public async turnOff(entityId: string): Promise<void> {
    const entity = await this.byId(entityId);
    if (!entity) {
      this.logger.error(`Could not find entity for ${entityId}`);
      return;
    }
    switch (domain(entityId)) {
      case HassDomains.group:
      case HassDomains.light:
      case HassDomains.switch:
        return await this.socketService.call(HassServices.turn_off, {
          entity_id: entityId,
        });
      case HassDomains.fan:
        return await this.socketService.call(HassServices.turn_off, {
          entity_id: entityId,
        });
    }
  }

  @Trace()
  public async turnOn(entityId: string): Promise<void> {
    const entity = await this.byId(entityId);
    if (!entity) {
      this.logger.error(`Could not find entity for ${entityId}`);
    }
    switch (domain(entityId)) {
      case HassDomains.switch:
        this.socketService.call(HassServices.turn_on, {
          entity_id: entityId,
        });
        return;
      case HassDomains.fan:
        this.socketService.call(HassServices.turn_on, {
          entity_id: entityId,
          speed: FanSpeeds.low,
        });
        return;
      case HassDomains.group:
      case HassDomains.light:
        return await this.circadianLight(entityId, this.getDefaultBrightness());
    }
  }

  /**
   * Retrieve an entity by it's entityId
   *
   * TODO: Decide if exiring cache makes sense. Current opinion: no
   */
  public async byId<
    T extends HassStateDTO = HassStateDTO<
      unknown,
      HomeAssistantEntityAttributes
    >
  >(entityId: string): Promise<T> {
    // if (
    //   !this.lastUpdate ||
    //   this.lastUpdate.isBefore(dayjs().subtract(5, 'minute'))
    // ) {
    //   this.logger.debug(`Cache Miss: ${entityId}`);
    //   await this.socketService.getAllEntitities();
    // }
    return this.ENTITIES.get(entityId) as T;
  }

  public async circadianLight(
    entityId: string,
    brightness_pct?: number,
  ): Promise<void> {
    const MIN_COLOR = 2500;
    const MAX_COLOR = 5500;
    const kelvin = (MAX_COLOR - MIN_COLOR) * this.getColorOffset() + MIN_COLOR;
    this.logger.trace({ entityId, kelvin, brightness_pct }, 'circadianLight');
    return await this.socketService.call(HassServices.turn_on, {
      entity_id: entityId,
      brightness_pct,
      kelvin,
    });
  }

  /**
   * All known entity ids
   */
  public entityList(): string[] {
    const out = [];
    this.ENTITIES.forEach((value, key) => out.push(key));
    return out;
  }

  // #endregion Public Methods

  // #region Protected Methods

  /**
   * - If it's relatively close to solar noon, lights come on at full brightness
   * - If the sun is still out, come on as slightly dimmed
   * - Come on at a more dim level if it's dark out
   */
  protected getDefaultBrightness(): number {
    const offset = this.getColorOffset();

    if (offset > 0.5) {
      return 100;
    }
    if (offset > 0) {
      return 80;
    }
    return 60;
  }

  // #endregion Protected Methods

  // #region Private Methods

  @OnEvent([ALL_ENTITIES_UPDATED])
  @Trace({ omitArgs: true })
  private onAllEntitiesUpdated(allEntities: HassStateDTO[]) {
    this.lastUpdate = dayjs();
    allEntities.forEach((entity) =>
      this.ENTITIES.set(entity.entity_id, entity),
    );
  }

  @OnEvent([HA_RAW_EVENT])
  @Trace()
  private onEntityUpdate(event: HassEventDTO) {
    if (!event.data.entity_id) {
      return;
    }
    this.ENTITIES.set(event.data.entity_id, event.data.new_state);
  }

  /**
   * Returns 0 when it's dark out, increasing to 1 at solar noon
   *
   * ### Future improvements
   *
   * The math could probably be improved, this seems more thought out:
   * https://github.com/claytonjn/hass-circadian_lighting/blob/master/custom_components/circadian_lighting/__init__.py#L206
   */
  private getColorOffset(): number {
    const calc = this.SOLAR_CALC;
    const noon = dayjs(calc.solarNoon);
    const dusk = dayjs(calc.dusk);
    const dawn = dayjs(calc.dawn);
    const now = dayjs();

    if (now.isBefore(dawn)) {
      // After midnight, but before dawn
      return 0;
    }
    if (now.isBefore(noon)) {
      // After dawn, but before solar noon
      return Math.abs(noon.diff(now, 's') / noon.diff(dawn, 's') - 1);
    }
    if (now.isBefore(dusk)) {
      // Afternoon, but before dusk
      return Math.abs(noon.diff(now, 's') / noon.diff(dusk, 's') - 1);
    }
    // Until midnight
    return 0;
  }

  private lightBrightness(entityId: string) {
    const entity = this.ENTITIES.get(entityId) as HassStateDTO<
      string,
      {
        brightness: number;
      }
    >;
    if (entity.state === 'off') {
      return 0;
    }
    return Math.round((entity.attributes.brightness / 256) * 100);
  }

  // #endregion Private Methods
}
