import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  InjectLogger,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { RoomControllerSettingsDTO } from '../contracts';

const CACHE_KEY = (room, flag) => `FLAGS:${room}/${flag}`;
/**
 * This service exists to manage room flags.
 * Future expansion as specific room functionality demands it's own state management
 */
@Injectable()
export class StateManagerService {
  constructor(
    @InjectCache() private readonly cacheService: CacheManagerService,
    @InjectLogger() private readonly logger: AutoLogService,
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
      ttl: 24 * 60 * 60,
    });
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
