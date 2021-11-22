import {
  KunamiCodeActivateDTO,
  ROUTINE_ACTIVATE_TYPE,
  RoutineActivateDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '@ccontour/controller-logic';
import { DONE, ICONS, PromptEntry, PromptService } from '@ccontour/tty';
import { IsEmpty, TitleCase } from '@ccontour/utilities';
import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { v4 as uuid } from 'uuid';

import {
  KunamiBuilderService,
  ScheduleBuilderService,
  SolarBuilderService,
  StateChangeBuilderService,
} from './activate';
import { RoutineService } from './routine.service';

type RService = RoutineService;
@Injectable()
export class RoutineActivateService {
  constructor(
    private readonly kunamiActivate: KunamiBuilderService,
    private readonly stateActivate: StateChangeBuilderService,
    private readonly schduleActivate: ScheduleBuilderService,
    private readonly solarActivate: SolarBuilderService,
    private readonly promptService: PromptService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineCommand: RService,
  ) {}

  public async build(
    routine: RoutineDTO,
    current: Partial<RoutineActivateDTO> = {},
  ): Promise<RoutineActivateDTO> {
    const friendlyName = await this.promptService.friendlyName(
      current.friendlyName,
    );
    const type = await this.promptService.pickOne<ROUTINE_ACTIVATE_TYPE>(
      `Activation type`,
      Object.values(ROUTINE_ACTIVATE_TYPE).map((value) => [
        TitleCase(value),
        value,
      ]),
      current.type,
    );
    switch (type) {
      case ROUTINE_ACTIVATE_TYPE.kunami:
        return {
          activate: await this.kunamiActivate.build(
            current.activate as KunamiCodeActivateDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_TYPE.solar:
        return {
          activate: await this.solarActivate.build(
            current.activate as SolarActivateDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_TYPE.state_change:
        return {
          activate: await this.stateActivate.build(
            current.activate as StateChangeActivateDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_TYPE.schedule:
        return {
          activate: await this.schduleActivate.build(
            current.activate as ScheduleActivateDTO,
          ),
          friendlyName,
          type,
        };
    }
    throw new NotImplementedException();
  }

  public async process(
    routine: RoutineDTO,
    activate: RoutineActivateDTO,
  ): Promise<RoutineDTO> {
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.EDIT}Edit`, 'edit'],
        [`${ICONS.DELETE}Delete`, 'delete'],
      ],
      `Routine activation`,
    );
    switch (action) {
      case DONE:
        return routine;
      case 'edit':
        const updated = await this.build(routine, activate);
        routine.activate = routine.activate.map((i) =>
          i.id === activate.id ? { ...updated, id: i.id } : i,
        );
        routine = await this.routineCommand.update(routine);
        return await this.process(
          routine,
          routine.activate.find(({ id }) => id === activate.id),
        );
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${chalk.bold.magenta(
              activate.friendlyName,
            )}? This cannot be undone`,
          ))
        ) {
          return await this.process(routine, activate);
        }
        routine.activate = routine.activate.filter(
          ({ id }) => id !== activate.id,
        );
        routine = await this.routineCommand.update(routine);
        return await this.process(
          routine,
          routine.activate.find(({ id }) => id === activate.id),
        );
    }
  }

  public async processRoutine(routine: RoutineDTO): Promise<RoutineDTO> {
    routine.activate ??= [];
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.CREATE}Add`, 'add'],
        ...this.promptService.conditionalEntries(!IsEmpty(routine.activate), [
          new inquirer.Separator(chalk.white`Current activations`),
          ...(routine.activate.map((activate) => [
            activate.friendlyName,
            activate,
          ]) as PromptEntry<RoutineActivateDTO>[]),
        ]),
      ],
      `Routine activations`,
    );
    switch (action) {
      case DONE:
        return routine;
      case 'add':
        const activate = await this.build(routine);
        activate.id = uuid();
        routine.activate.push(activate);
        routine = await this.routineCommand.update(routine);
        return await this.processRoutine(routine);
    }
    if (typeof action === 'string') {
      throw new NotImplementedException();
    }
    routine = await this.process(routine, action);
    return await this.processRoutine(routine);
  }
}
