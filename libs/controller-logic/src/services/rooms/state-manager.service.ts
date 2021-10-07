import { SwitchDomainService } from '@automagical/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  InjectConfig,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { CACHE_TTL } from '../../config';
import { RoomControllerSettingsDTO } from '../../contracts';
import { LightManagerService } from '../light-manager.service';
import { StatePersistenceService } from '../persistence/state-persistence.service';

const CACHE_KEY = (room, flag) => `FLAGS:${room}/${flag}`;

/**
 * This service exists to manage room flags.
 * Future expansion as specific room functionality demands it's own state management
 */
@Injectable()
export class StateManagerService {
  constructor(
    private readonly lightManager: LightManagerService,
    private readonly switchService: SwitchDomainService,
    private readonly statePersistence: StatePersistenceService,
    @InjectCache() private readonly cacheService: CacheManagerService,
    private readonly logger: AutoLogService,
    @InjectConfig(CACHE_TTL) private readonly cacheTtl: number,
  ) {}

  @Trace()
  public async addFlag(
    {
      friendlyName,
      name,
    }: Pick<RoomControllerSettingsDTO, 'name' | 'friendlyName'>,
    flagName: string,
  ): Promise<void> {
    if (await this.hasFlag({ name }, flagName)) {
      return;
    }
    this.logger.debug(`[${friendlyName}] Add flag {${flagName}}`);
    const key = CACHE_KEY(name, flagName);
    await this.cacheService.set(key, true, {
      ttl: this.cacheTtl,
    });
  }

  @Trace()
  public async deleteState(id: string): Promise<void> {
    await this.statePersistence.delete(id);
  }

  @Trace()
  public async hasFlag(
    { name }: Pick<RoomControllerSettingsDTO, 'name'>,
    flagName: string,
  ): Promise<boolean> {
    return await this.cacheService.wrap<boolean>(
      CACHE_KEY(name, flagName),
      () => false,
    );
  }

  @Trace()
  public async removeFlag(
    {
      friendlyName,
      name,
    }: Pick<RoomControllerSettingsDTO, 'name' | 'friendlyName'>,
    flagName: string,
  ): Promise<void> {
    if (!(await this.hasFlag({ name }, flagName))) {
      return;
    }
    this.logger.debug(`[${friendlyName}] Remove flag {${flagName}}`);
    this.cacheService.del(CACHE_KEY(name, flagName));
  }
}
