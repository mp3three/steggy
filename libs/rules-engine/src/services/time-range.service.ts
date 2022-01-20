import { Injectable } from '@nestjs/common';
import { AutoLogService, is } from '@text-based/utilities';
import dayjs from 'dayjs';

import { TimeRangeDTO } from '../contracts';

@Injectable()
export class TimeRangeService {
  constructor(private readonly logger: AutoLogService) {}

  public test(comparison: TimeRangeDTO): boolean {
    const now = dayjs();
    const day = now.format('D,DD,dd,ddd,dddd').toLowerCase().split(',');
    const hour = now.format('H,HH').toLowerCase().split(',');
    const month = now.format('M,MM,MMM,MMMM').toLowerCase().split(',');
    if (!is.empty(comparison.hours)) {
      const state = comparison.hours.some((i) =>
        hour.includes(i.toLowerCase()),
      );
      if (state === false) {
        return false;
      }
    }
    if (!is.empty(comparison.days)) {
      const state = comparison.days.some((i) => day.includes(i.toLowerCase()));
      if (state === false) {
        return false;
      }
    }
    if (!is.empty(comparison.month)) {
      const state = comparison.month.some((i) =>
        month.includes(i.toLowerCase()),
      );
      if (state === false) {
        return false;
      }
    }
    return false;
  }
}
