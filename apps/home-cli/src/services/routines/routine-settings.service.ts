import { RoutineDTO } from '@ccontour/controller-logic';
import { DONE, ICONS, PromptService } from '@ccontour/tty';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { RoutineService } from './routine.service';

type tRoutineService = RoutineService;
@Injectable()
export class RoutineSettingsService {
  constructor(
    private readonly promptService: PromptService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineService: tRoutineService,
  ) {}

  public async process(
    routine: RoutineDTO,
    defaultAction?: string,
  ): Promise<RoutineDTO> {
    const action = await this.promptService.menuSelect(
      [
        [
          routine.sync
            ? `${ICONS.SWAP}Run commands in parallel`
            : `${ICONS.SWAP}Run commands in series`,
          `sync`,
        ],
      ],
      `Manage settings`,
      defaultAction,
    );
    switch (action) {
      case DONE:
        return routine;
      case 'sync':
        routine.sync = !routine.sync;
        routine = await this.routineService.update(routine);
        return await this.process(routine, action);
    }
    return routine;
  }
}
