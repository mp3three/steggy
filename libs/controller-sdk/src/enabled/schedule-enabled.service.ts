import { AutoLogService } from '@steggy/boilerplate';
import { STOP_PROCESSING_TYPE } from '@steggy/controller-shared';

import { RoutineEnabled } from '../decorators';
import { ChronoService } from '../services';

@RoutineEnabled(STOP_PROCESSING_TYPE.date)
export class ScheduleEnabledService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly chronoService: ChronoService,
  ) {}
}
