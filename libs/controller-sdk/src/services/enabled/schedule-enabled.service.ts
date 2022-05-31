import { forwardRef, Inject } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  RoutineDTO,
  RoutineRelativeDateComparisonDTO,
  STOP_PROCESSING_TYPE,
} from '@steggy/controller-shared';
import { HALF, is, MINUTE, SECOND } from '@steggy/utilities';

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
      this.logger.error({ comparison }, `Expression failed parsing`);
      return;
    }
    let currentState = false;
    const interval = setInterval(() => {
      const result = this.stopProcessing.dateComparison(comparison);
      if (result === currentState) {
        return;
      }
      currentState = result;
      // Just announce something changed. It'll figure it out
      this.routineEnabled.onUpdate(routine);
      // Just messing around with times
    }, HALF * MINUTE * (Math.random() * SECOND));

    return () => {
      clearInterval(interval);
    };
  }
}
