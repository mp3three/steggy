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
      this.logger.error(
        { comparison },
        `[${this.routineEnabled.superFriendlyName(
          routine._id,
        )}] Expression failed parsing`,
      );
      return;
    }
    const interval = this.poll(comparison, routine);
    return () => clearInterval(interval);
  }

  private async check(
    comparison: RoutineRelativeDateComparisonDTO,
    routine: RoutineDTO,
    currentState: boolean,
  ): Promise<boolean> {
    const result = this.stopProcessing.dateComparison(comparison);
    if (result !== currentState) {
      this.logger.info(
        `[${this.routineEnabled.superFriendlyName(routine._id)}] State changed`,
      );
      return result;
    }
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
        await sleep(startDate.getTime() - Date.now());
        return await this.check(comparison, routine, currentState);
      }
    }
    if (is.date(endDate)) {
      const end = dayjs(endDate);
      if (end.isAfter(endDate) && end.isBefore(dayjs().add(HALF, 'minute'))) {
        await sleep(endDate.getTime() - Date.now());
        return await this.check(comparison, routine, currentState);
      }
    }
    return result;
  }

  private poll(
    comparison: RoutineRelativeDateComparisonDTO,
    routine: RoutineDTO,
  ) {
    let currentState = this.stopProcessing.dateComparison(comparison);
    return setInterval(async () => {
      const last = currentState;
      currentState = await this.check(comparison, routine, currentState);
      if (currentState !== last) {
        this.routineEnabled.onUpdate(routine._id);
      }
    }, HALF * MINUTE);
  }
}
