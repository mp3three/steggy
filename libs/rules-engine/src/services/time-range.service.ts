import { AutoLogService, IsEmpty } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';
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
    if (!IsEmpty(comparison.hours)) {
      const state = comparison.hours.some((i) =>
        hour.includes(i.toLowerCase()),
      );
      if (state === false) {
        return false;
      }
    }
    if (!IsEmpty(comparison.days)) {
      const state = comparison.days.some((i) => day.includes(i.toLowerCase()));
      if (state === false) {
        return false;
      }
    }
    if (!IsEmpty(comparison.month)) {
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
