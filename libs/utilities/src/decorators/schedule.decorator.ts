import {
  CRON_SCHEDULE,
  CronExpression,
} from '@automagical/utilities';
import { SetMetadata } from '@nestjs/common';

export enum CronObject {
  second,
  minute,
  hour,
  dayOfMonth,
  month,
  dayOfWeek,
}

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
