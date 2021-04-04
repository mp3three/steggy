import { ALL_ENTITIES_UPDATED } from '@automagical/contracts/constants';
import {
  FanSpeeds,
  HassDomains,
  HassServices,
  HassStateDTO,
} from '@automagical/contracts/home-assistant';
import { Logger } from '@automagical/logger';
import { sleep } from '@automagical/utilities';
import {
  CACHE_MANAGER,
  GoneException,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cache } from 'cache-manager';
import { SocketService } from './socket.service';

@Injectable()
export class EntityService {
  // #region Object Properties

  private readonly KNOWN_ENTITY_IDS: string[] = [];

  private logger = Logger(EntityService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly socketService: SocketService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @OnEvent([ALL_ENTITIES_UPDATED])
  public allEntityUpdate(allEntities: HassStateDTO[]): void {
    this.logger.notice(`allEntityUpdate: ${allEntities.length} items`);
    allEntities.forEach(async (entity) => {
      if (!this.KNOWN_ENTITY_IDS.includes(entity.entity_id)) {
        this.KNOWN_ENTITY_IDS.push(entity.entity_id);
      }
      return this.cacheService.set(entity.entity_id, entity);
    });
  }

  /**
   * Retrieve an entity by it's entityId
   */
  public async byId<T extends HassStateDTO = HassStateDTO>(
    entityId: string,
    abort = false,
  ): Promise<T> {
    const cachedValue = await this.cacheService.get(entityId);
    if (cachedValue) {
      return;
    }
    if (abort) {
      throw new GoneException(`${entityId} could not be found`);
    }
    this.logger.debug(`Cache Miss: ${entityId}`);
    await this.socketService.updateAllEntities();
    // Probably way overkill
    // Let the caching finish
    await sleep(10);
    return this.byId<T>(entityId, true);
  }

  public async fanSpeedDown(
    currentSpeed: FanSpeeds,
    entityId: string,
  ): Promise<void> {
    const availableSpeeds = [
      FanSpeeds.high,
      FanSpeeds.medium_high,
      FanSpeeds.medium,
      FanSpeeds.low,
      FanSpeeds.off,
    ];
    const idx = availableSpeeds.indexOf(currentSpeed);
    if (idx === 0) {
      this.logger.debug(`Cannot speed down`);
      return;
    }
    return this.socketService.call(HassDomains.fan, HassServices.turn_on, {
      entity_id: entityId,
      speed: availableSpeeds[idx - 1],
    });
  }

  public async fanSpeedUp(
    currentSpeed: FanSpeeds,
    entityId: string,
  ): Promise<void> {
    const availableSpeeds = [
      FanSpeeds.high,
      FanSpeeds.medium_high,
      FanSpeeds.medium,
      FanSpeeds.low,
      FanSpeeds.off,
    ];
    const idx = availableSpeeds.indexOf(currentSpeed);
    if (idx === availableSpeeds.length - 1) {
      this.logger.debug(`Cannot speed up`);
      return;
    }
    return this.socketService.call(HassDomains.fan, HassServices.turn_on, {
      entity_id: entityId,
      speed: availableSpeeds[idx + 1],
    });
  }

  /**
   * All known entity ids
   */
  public listEntities(): string[] {
    return this.KNOWN_ENTITY_IDS;
  }

  public async toggle(entityId: string): Promise<void> {
    if (!entityId) {
      return;
    }
    const entity = await this.byId(entityId);
    if (entity.state === 'on') {
      return this.turnOff(entityId);
    }
    return this.turnOn(entityId);
  }

  public turnOff(
    entityId: string,
    groupData: Record<string, string[]> = {},
  ): Promise<void> {
    if (!entityId) {
      return;
    }
    this.logger.debug(`turnOff ${entityId}`);
    const parts = entityId.split('.');
    const domain = parts[0] as HassDomains;
    const suffix = parts[1];
    switch (domain) {
      case HassDomains.switch:
      case HassDomains.light:
        return this.socketService.call(domain, HassServices.turn_off, {
          entity_id: entityId,
        });
      case HassDomains.fan:
        return this.socketService.call(HassDomains.fan, HassServices.turn_off, {
          entity_id: entityId,
        });
      case HassDomains.group:
        if (!groupData[suffix]) {
          throw new NotImplementedException(
            `Cannot find group information for ${suffix}`,
          );
        }
        groupData[suffix].forEach((id) => this.turnOff(id, groupData));
        return;
    }
  }

  public async turnOn(
    entityId: string,
    groupData: Record<string, string[]> = {},
  ): Promise<void> {
    if (!entityId) {
      return;
    }
    this.logger.debug(`turnOn ${entityId}`);
    const parts = entityId.split('.');
    const domain = parts[0] as HassDomains;
    const suffix = parts[1];
    switch (domain) {
      case HassDomains.switch:
        return this.socketService.call(
          HassDomains.switch,
          HassServices.turn_on,
          { entity_id: entityId },
        );
      case HassDomains.fan:
        return this.socketService.call(HassDomains.fan, HassServices.turn_on, {
          entity_id: entityId,
          speed: FanSpeeds.medium,
        });
      case HassDomains.light:
        return this.socketService.call(
          HassDomains.light,
          HassServices.turn_on,
          {
            entity_id: entityId,
            brightness_pct: 50,
            effect: 'random',
          },
        );
      case HassDomains.group:
        if (!groupData[suffix]) {
          throw new NotImplementedException(
            `Cannot find group information for ${suffix}`,
          );
        }
        groupData[suffix].forEach((id) => this.turnOn(id, groupData));
        return;
    }
  }

  // #endregion Public Methods
}
