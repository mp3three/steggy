import { forwardRef, Inject } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  RoutineDTO,
  RoutineRelativeDateComparisonDTO,
  STOP_PROCESSING_TYPE,
} from '@steggy/controller-shared';
import { HALF, is, MINUTE, sleep } from '@steggy/utilities';
import dayjs from 'dayjs';

import { StopProcessingCommandService } from '../../commands';
import { iRoutineEnabled, RoutineEnabled } from '../../decorators';
import { ChronoService } from '../misc';
import { RoutineEnabledService } from '../routine-enabled.service';

const A_LITTLE_EXTRA = 10;
@RoutineEnabled({ type: [STOP_PROCESSING_TYPE.date] })
export class ScheduleEnabledService
  implements iRoutineEnabled<RoutineRelativeDateComparisonDTO>
{
  constructor(
    private readonly logger: AutoLogService,
    private readonly chronoService: ChronoService,
    @Inject(forwardRef(() => StopProcessingCommandService))
    private readonly stopProcessing: StopProcessingCommandService,
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
    const interval = this.poll(comparison, routine);
    return () => {
      clearInterval(interval);
    };
  }

  private async check(
    comparison: RoutineRelativeDateComparisonDTO,
    routine: RoutineDTO,
    currentState: boolean,
  ): Promise<boolean> {
    const result = this.stopProcessing.dateComparison(comparison);
    if (result === currentState) {
      const [startDate, endDate] = this.chronoService.parse<boolean>(
        comparison.expression,
        false,
      );
      if (is.date(startDate)) {
        const start = dayjs(startDate);
        if (
          start.isAfter(startDate) &&
          start.isBefore(dayjs().add(HALF, 'minute'))
        ) {
          await sleep(startDate.getTime() - Date.now() + A_LITTLE_EXTRA);
          return await this.check(comparison, routine, currentState);
        }
      }
      if (is.date(endDate)) {
        const end = dayjs(endDate);
        if (end.isAfter(endDate) && end.isBefore(dayjs().add(HALF, 'minute'))) {
          await sleep(endDate.getTime() - Date.now() + A_LITTLE_EXTRA);
          return await this.check(comparison, routine, currentState);
        }
      }
      return result;
    }
    currentState = result;
    // Just announce something changed. It'll figure it out
    this.routineEnabled.onUpdate(routine);
    return result;
  }

  private poll(
    comparison: RoutineRelativeDateComparisonDTO,
    routine: RoutineDTO,
  ) {
    let currentState = false;
    return setInterval(async () => {
      currentState = await this.check(comparison, routine, currentState);
      // Just messing around with times
    }, HALF * MINUTE);
  }
}
