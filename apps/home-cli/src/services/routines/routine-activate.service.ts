import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import {
  ROUTINE_ACTIVATE_TYPE,
  RoutineActivateDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SequenceActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '@steggy/controller-shared';
import {
  ApplicationManagerService,
  IsDone,
  PromptService,
  ScreenService,
  TextRenderingService,
  ToMenuEntry,
} from '@steggy/tty';
import { is, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';
import Table from 'cli-table';
import { v4 as uuid } from 'uuid';

import { MENU_ITEMS } from '../../includes';
import { ICONS } from '../../types';
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
    @Inject(forwardRef(() => KunamiBuilderService))
    private readonly kunamiActivate: KunamiBuilderService,
    private readonly stateActivate: StateChangeBuilderService,
    private readonly scheduleActivate: ScheduleBuilderService,
    private readonly solarActivate: SolarBuilderService,
    private readonly textRender: TextRenderingService,
    private readonly promptService: PromptService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineCommand: RService,
    private readonly applicationManager: ApplicationManagerService,
    private readonly screenService: ScreenService,
  ) {}

  public async build(
    routine: RoutineDTO,
    current: Partial<RoutineActivateDTO> = {},
  ): Promise<RoutineActivateDTO> {
    const friendlyName = await this.promptService.string(
      'Friendly Name',
      current.friendlyName,
    );
    const type = await this.promptService.pickOne<ROUTINE_ACTIVATE_TYPE>(
      `Activation type`,
      ToMenuEntry(
        Object.values(ROUTINE_ACTIVATE_TYPE).map(value => [
          TitleCase(value),
          value,
        ]),
      ),
      current.type,
    );
    switch (type) {
      case ROUTINE_ACTIVATE_TYPE.kunami:
        return {
          activate: await this.kunamiActivate.build(
            current.activate as SequenceActivateDTO,
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
          activate: await this.scheduleActivate.build(
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
    const action = await this.promptService.menu({
      keyMap: {
        d: MENU_ITEMS.DONE,
      },
      right: ToMenuEntry([MENU_ITEMS.EDIT, MENU_ITEMS.DELETE]),
      rightHeader: `Routine activation`,
    });
    if (IsDone(action)) {
      return routine;
    }
    switch (action) {
      case 'edit':
        const updated = await this.build(routine, activate);
        routine.activate = routine.activate.map(i =>
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
    this.header(routine);
    routine.activate ??= [];
    const action = await this.promptService.menu({
      item: 'activations',
      keyMap: { a: MENU_ITEMS.ADD, d: MENU_ITEMS.DONE },
      right: ToMenuEntry(
        routine.activate.map(activate => [activate.friendlyName, activate]),
      ),
      rightHeader: `Routine activations`,
    });
    if (IsDone(action)) {
      return routine;
    }
    if (action === 'add') {
      const activate = await this.build(routine);
      activate.id = uuid();
      routine.activate.push(activate);
      routine = await this.routineCommand.update(routine);
      return await this.processRoutine(routine);
    }
    if (is.string(action)) {
      throw new NotImplementedException();
    }
    routine = await this.process(routine, action);
    return await this.processRoutine(routine);
  }

  private header(routine: RoutineDTO): void {
    this.applicationManager.setHeader(`Activations`, routine.friendlyName);
    this.screenService.printLine();
    if (is.empty(routine.activate)) {
      this.screenService.printLine(
        chalk.bold`{cyan >>> }${ICONS.EVENT}{yellow No activation events}`,
      );
    } else {
      this.screenService.printLine(chalk`  {blue.bold Activation Events}`);
      const table = new Table({
        head: ['Name', 'Type', 'Details'],
      });
      routine.activate.forEach(activate => {
        table.push([
          activate.friendlyName,
          TitleCase(activate.type),
          this.textRender.type(activate.activate),
        ]);
      });
      this.screenService.printLine(table.toString());
    }
  }
}
