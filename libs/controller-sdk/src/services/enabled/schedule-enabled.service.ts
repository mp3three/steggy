import { AutoLogService } from '@steggy/boilerplate';
import {
  RoutineDTO,
  RoutineRelativeDateComparisonDTO,
  STOP_PROCESSING_TYPE,
} from '@steggy/controller-shared';
import { EMPTY, HALF, INCREMENT, is, MINUTE } from '@steggy/utilities';
import dayjs from 'dayjs';

import { iRoutineEnabled, RoutineEnabled } from '../../decorators';
import { ChronoService } from '../misc';
import { RoutineEnabledService } from '../routine-enabled.service';

const A_FEW = 5;

@RoutineEnabled({ type: [STOP_PROCESSING_TYPE.date] })
export class ScheduleEnabledService
  implements iRoutineEnabled<RoutineRelativeDateComparisonDTO>
{
  constructor(
    private readonly logger: AutoLogService,
    private readonly chronoService: ChronoService,
    private readonly routineEnabled: RoutineEnabledService,
  ) {}

  public watch(
    comparison: RoutineRelativeDateComparisonDTO,
    routine: RoutineDTO,
  ): () => void {
    const [parsed] = this.chronoService.parse<boolean>(
      comparison.expression,
      false,
    );
    if (is.boolean(parsed)) {
      this.logger.error({ comparison }, `Expression failed parsing`);
      return;
    }
    let { timeouts, expired } = this.rangeTimeouts(comparison, routine);
    let lastRefresh = dayjs();
    const interval = setInterval(() => {
      if (
        // If there are still upcoming events, do nothing
        !is.empty(timeouts) &&
        expired() > EMPTY &&
        // But let's refresh periodically anyways
        // This is my hack to avoid debugging why it otherwise seems to get stuck
        //
        // Since no network requests are involved, and it's not that expensive to do...
        // Should be fine
        lastRefresh.isAfter(dayjs().subtract(A_FEW, 'minute'))
      ) {
        return;
      }
      lastRefresh = dayjs();

      // re-parse the expression
      const [start] = this.chronoService.parse<Date>(comparison.expression);
      const now = dayjs();
      if (now.isAfter(start)) {
        return;
      }
      const out = this.rangeTimeouts(comparison, routine);
      timeouts = out.timeouts;
      expired = out.expired;
    }, HALF * MINUTE);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      clearInterval(interval);
    };
  }

  private rangeTimeouts(
    comparison: RoutineRelativeDateComparisonDTO,
    routine: RoutineDTO,
  ) {
    const [start, end] = this.chronoService.parse(comparison.expression, false);
    const now = Date.now();
    if (is.boolean(start)) {
      this.logger.error({ comparison }, `Expression failed parsing`);
      return;
    }
    this.logger.debug(
      { end, start },
      `Testing expression: {${comparison.expression}}`,
    );
    //
    const sendUpdate = async () => {
      await this.routineEnabled.onUpdate(routine);
      timeouts.shift();
      expired--;
    };
    let expired = 1;
    const timeouts: NodeJS.Timeout[] = [];
    //
    timeouts.push(setTimeout(sendUpdate, start.getTime() - now + INCREMENT));
    if (end) {
      expired++;
      timeouts.push(setTimeout(sendUpdate, end.getTime() - now + INCREMENT));
    }
    return { expired: () => expired, timeouts };
  }
}
