import { Injectable } from '@nestjs/common';
import { GroupService } from '@text-based/controller-logic';
import {
  EntityManagerService,
  NotifyDomainService,
} from '@text-based/home-assistant';
import {
  AutoLogService,
  CacheManagerService,
  Cron,
  CronExpression,
  InjectCache,
  InjectConfig,
  IsEmpty,
} from '@text-based/utilities';
import { each } from 'async';
import dayjs from 'dayjs';

import {
  NOTIFY_UNAVAILABLE_DURATION,
  UNAVAILABLE_MONITOR_HOUR,
} from '../config';

const CACHE_KEY = (id: string) => `RECENTLY_UNAVAILABLE:${id}`;
const WAIT_DAYS = 1;
type RecentItem = {
  entity_id: string;
  since: number;
};

@Injectable()
export class AvailabilityMonitorService {
  constructor(
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly logger: AutoLogService,
    private readonly groupService: GroupService,
    private readonly entityService: EntityManagerService,
    private readonly notifyService: NotifyDomainService,
    @InjectConfig(NOTIFY_UNAVAILABLE_DURATION)
    private readonly unavailableDuration: number,
    @InjectConfig(UNAVAILABLE_MONITOR_HOUR)
    private readonly notifyHour: number,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  protected async checkAvailability(): Promise<void> {
    return;
    const groups = await this.groupService.list();
    const searchList = groups
      .flatMap((i) => i.entities)
      .filter((item, index, array) => array.indexOf(item) === index);
    const entities = searchList.filter(
      (id) => this.entityService.getEntity(id).state === 'unavailable',
    );
    if (IsEmpty(entities)) {
      this.logger.debug(`No unavailable entities`);
      return;
    }
    await this.alertNewErrors(
      entities,
      new Date().getHours() === this.notifyHour,
    );
  }

  private async alertNewErrors(
    entities: string[],
    notify = false,
  ): Promise<void> {
    const sendAlerts: string[] = [];
    const now = Date.now();
    const since = now - this.unavailableDuration;
    const midnight = dayjs(dayjs().format('YYYY-MM-DD'));
    const yesterday = (
      midnight.toDate().getTime() < since
        ? midnight.subtract(WAIT_DAYS, 'day')
        : midnight
    )
      .toDate()
      .getTime();
    await each(entities, async (item, callback) => {
      const cache = (await this.cache.get<RecentItem>(CACHE_KEY(item))) ?? {
        entity_id: item,
        since: now,
      };
      if (cache.since < yesterday) {
        sendAlerts.push(item);
      } else if (cache.since < since) {
        this.logger.warn(`[${item}] unavailable`);
      }
      if (callback) {
        callback();
      }
    });
    if (IsEmpty(sendAlerts) || !notify) {
      return;
    }
    await this.notifyService.notify(
      `Unavailable entities: ${sendAlerts.join(', ')}`,
    );
  }
}
