import { CRON_SCHEDULE, LOG_CONTEXT } from '@automagical/contracts/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { CronJob } from 'cron';

import { Info } from '../decorators/logger.decorator';
import { AutoLogService } from './logger';

@Injectable()
export class ScheduleExplorerService {
  // #region Constructors

  constructor(
    private readonly logger: AutoLogService,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Info({ after: `Scheduler initialized` })
  protected onApplicationBootstrap(): void {
    const instanceWrappers: InstanceWrapper[] = [
      ...this.discoveryService.getControllers(),
      ...this.discoveryService.getProviders(),
    ];
    instanceWrappers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (!instance || !Object.getPrototypeOf(instance)) {
        return;
      }
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          const schedule: string = this.reflector.get(
            CRON_SCHEDULE,
            instance[key],
          );
          if (!schedule) {
            return;
          }
          this.logger.debug(
            `${instance.constructor[LOG_CONTEXT]}#${key} cron {${schedule}}`,
          );
          const cronJob = new CronJob(schedule, () => instance[key]());
          cronJob.start();
        },
      );
    });
  }

  // #endregion Protected Methods
}
