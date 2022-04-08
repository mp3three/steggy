import { CRON_SCHEDULE } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { CronJob } from 'cron';

import { LOG_CONTEXT } from '../../contracts/logger/constants';
import { AutoLogService } from '../auto-log.service';

@Injectable()
export class ScheduleExplorerService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

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
    this.logger.info(`[Scheduler] initialized`);
  }
}
