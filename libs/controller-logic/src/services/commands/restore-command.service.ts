import { Injectable } from '@nestjs/common';
import { EntityManagerService } from '@text-based/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
} from '@text-based/utilities';

import {
  RoutineCaptureData,
  RoutineDTO,
  RoutineRestoreCommandDTO,
} from '../../contracts';

@Injectable()
export class RestoreCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly entityService: EntityManagerService,
    @InjectCache() private readonly cache: CacheManagerService,
  ) {}

  public async activate(
    command: RoutineRestoreCommandDTO,
    routine: RoutineDTO,
  ): Promise<void> {
    command.key ??= routine._id;
    const cache = await this.cache.get<RoutineCaptureData>(command.key);
    if (!cache) {
      this.logger.error(`Missing cache {${command.key}}`);
      return;
    }
    // this.entityService
    this.logger.debug(`Restored cache state ${command.key}`);
  }
}
