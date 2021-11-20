import { SetMetadata } from '@nestjs/common';

import { CRON_SCHEDULE, CronExpression } from '../contracts';

export enum CronObject {
  second,
  minute,
  hour,
  dayOfMonth,
  month,
  dayOfWeek,
}

/**
 * CronExpression | string
 */
export function Cron(
  schedule: string | CronExpression | Record<keyof CronObject, string>,
): MethodDecorator {
  return SetMetadata(
    CRON_SCHEDULE,
    typeof schedule === 'string'
      ? schedule
      : Object.keys(CronObject)
          .map((key) => schedule[key] ?? '*')
          .join(' '),
  );
}
