import {
  ALL_ENTITIES_UPDATED,
  HA_RAW_EVENT,
} from '@automagical/contracts/constants';
import {
  FanSpeeds,
  HassDomains,
  HassEventDTO,
  HassServices,
  HassStateDTO,
} from '@automagical/contracts/home-assistant';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
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

@Injectable()
export class EntityService {
  // #region Object Properties

  private readonly CIRCADIAN_BRIGHTNESS = new Map<string, number>();
  private readonly ENTITIES = new Map<string, HassStateDTO>();

  private _SOLAR_CALC = null;
  private lastUpdate = dayjs();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectPinoLogger(EntityService.name) protected readonly logger: PinoLogger,
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
      // TODO: Can the LAT/LONG be populated via home assistant?
      Number(this.configService.get('application.LAT')),
      Number(this.configService.get('application.LONG')),
    );
  }

  // #endregion Public Accessors

  // #region Public Methods

  /**
   * Retrieve an entity by it's entityId
   */
  public async byId<T extends HassStateDTO = HassStateDTO>(
    entityId: string,
  ): Promise<T> {
    if (this.lastUpdate.isBefore(dayjs().subtract(5, 'minute'))) {
      this.logger.debug(`Cache Miss: ${entityId}`);
      await this.socketService.updateAllEntities();
    }
    return this.ENTITIES.get(entityId) as T;
  }

  public async circadianLight(entityId: string): Promise<void> {
    const MIN_COLOR = 2500;
    const MAX_COLOR = 5500;
    const brightness = this.CIRCADIAN_BRIGHTNESS.get(entityId);
    const temp = (MAX_COLOR - MIN_COLOR) * this.getColorOffset() + MIN_COLOR;
    this.logger.warn(
      {
        entityId,
        temp,
      },
      'circadianLighting',
    );
    this.socketService.call(HassDomains.light, HassServices.turn_on, {
      entity_id: entityId,
      brightness_pct: brightness,
      kelvin: temp,
    });
  }

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
    this.socketService.call(HassDomains.fan, HassServices.turn_on, {
      entity_id: entityId,
      speed: availableSpeeds[idx - 1],
    });
  }

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
    this.socketService.call(HassDomains.fan, HassServices.turn_on, {
      entity_id: entityId,
      speed: availableSpeeds[idx + 1],
    });
  }

  public async lightDim(
    entityId: string,
    delta: number,
    groupData: Map<string, string[]> = new Map(),
  ): Promise<void> {
    const [domain, suffix] = entityId.split('.');
    if (domain === HassDomains.group) {
      groupData
        .get(suffix)
        .forEach((id) => this.lightDim(id, delta, groupData));
      return;
    }
    if (!this.CIRCADIAN_BRIGHTNESS.has(entityId)) {
      // 🤷‍♂️
      this.turnOn(entityId, groupData);
      return;
    }
    const brightness = this.CIRCADIAN_BRIGHTNESS.get(entityId) + delta;
    this.logger.info(`${entityId} set brightness: ${brightness}% (${delta}%)`);
    this.CIRCADIAN_BRIGHTNESS.set(entityId, brightness);
    this.circadianLight(entityId);
  }

  /**
   * All known entity ids
   */
  public listEntities(): string[] {
    return Object.keys(this.ENTITIES);
  }

  public async toggle(entityId: string): Promise<void> {
    this.logger.debug(`toggle ${entityId}`);
    const entity = await this.byId(entityId);
    if (entity.state === 'on') {
      this.turnOff(entityId);
      return;
    }
    this.turnOn(entityId);
  }

  public async turnOff(
    entityId: string,
    groupData: Map<string, string[]> = new Map(),
  ): Promise<void> {
    if (!entityId) {
      return;
    }
    this.logger.debug(`turnOff ${entityId}`);
    const parts = entityId.split('.');
    const domain = parts[0] as HassDomains;
    const suffix = parts[1];
    let entity;
    if (domain !== HassDomains.group) {
      entity = await this.byId(entityId);
      if (!entity) {
        this.logger.error(`Could not find entity for ${entityId}`, groupData);
      }
    }
    switch (domain) {
      case HassDomains.light:
        this.CIRCADIAN_BRIGHTNESS.delete(entityId);
      // fall through
      case HassDomains.switch:
        this.socketService.call(domain, HassServices.turn_off, {
          entity_id: entityId,
        });
        return;
      case HassDomains.fan:
        this.socketService.call(HassDomains.fan, HassServices.turn_off, {
          entity_id: entityId,
        });
        return;
      case HassDomains.group:
        if (!groupData.get(suffix)) {
          throw new NotImplementedException(
            `Cannot find group information for ${suffix}`,
          );
        }
        groupData.get(suffix).forEach((id) => this.turnOff(id, groupData));
        return;
    }
  }

  public async turnOn(
    entityId: string,
    groupData: Map<string, string[]> = new Map(),
  ): Promise<void> {
    if (!entityId) {
      return;
    }
    this.logger.debug(`turnOn ${entityId}`);
    const [domain, suffix] = entityId.split('.');
    let entity;
    if (domain !== HassDomains.group) {
      entity = await this.byId(entityId);
      if (!entity) {
        this.logger.error(`Could not find entity for ${entityId}`, groupData);
      }
    }
    switch (domain) {
      case HassDomains.switch:
        this.socketService.call(HassDomains.switch, HassServices.turn_on, {
          entity_id: entityId,
        });
        return;
      case HassDomains.fan:
        this.socketService.call(HassDomains.fan, HassServices.turn_on, {
          entity_id: entityId,
          speed: FanSpeeds.low,
        });
        return;
      case HassDomains.light:
        if (entity.state === 'on') {
          // this.logger.warn(entity);
          // The circadian throws things off with repeat on calls
          return;
        }
        const brightness = this.getDefaultBrightness();
        this.CIRCADIAN_BRIGHTNESS.set(entityId, brightness);
        this.socketService.call(HassDomains.light, HassServices.turn_on, {
          entity_id: entityId,
          brightness_pct: brightness,
          // effect: 'random',
        });
        return;
      case HassDomains.group:
        if (!groupData.get(suffix)) {
          throw new NotImplementedException(
            `Cannot find group information for ${suffix}`,
          );
        }
        groupData.get(suffix).forEach((id) => this.turnOn(id, groupData));
        return;
    }
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
  private onAllEntitiesUpdated(allEntities: HassStateDTO[]) {
    this.logger.debug(`onAllEntitiesUpdated`);
    this.lastUpdate = dayjs();
    allEntities.forEach((entity) => (this.ENTITIES[entity.entity_id] = entity));
  }

  @OnEvent([HA_RAW_EVENT])
  private onEntityUpdate(event: HassEventDTO) {
    if (!event.data.entity_id) {
      return;
    }
    this.ENTITIES[event.data.entity_id] = event.data.new_state;
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
      return noon.diff(now, 's') / noon.diff(dawn, 's');
    }
    if (now.isBefore(dusk)) {
      // Afternoon, but before dusk
      return noon.diff(now, 's') / noon.diff(dusk, 's');
    }
    // Until midnight
    return 0;
  }

  // #endregion Private Methods
}
