import { ROUTINE_UPDATE } from '@automagical/controller-logic';
import { AutoLogService, OnEvent } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { KunamiCodeActivateService } from './kunami-code-activate.service';
import { ScheduleActivateService } from './schedule-activate.service';
import { StateChangeActivateService } from './state-change-activate.service';

@Injectable()
export class RoutineService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly kunamiCode: KunamiCodeActivateService,
    private readonly scheduleActivate: ScheduleActivateService,
    private readonly stateChangeActivate: StateChangeActivateService,
  ) {}

  @OnEvent(ROUTINE_UPDATE)
  protected remount(): void {
    //
  }
}
