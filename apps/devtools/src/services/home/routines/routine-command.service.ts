import {
  KunamiCodeActivateDTO,
  ROUTINE_ACTIVATE_TYPE,
  RoutineActivateDTO,
  RoutineDTO,
  StateChangeActivateDTO,
} from '@automagical/controller-logic';
import {
  DONE,
  PromptEntry,
  PromptService,
  Repl,
  REPL_TYPE,
} from '@automagical/tty';
import { IsEmpty, TitleCase } from '@automagical/utilities';
import { NotImplementedException } from '@nestjs/common';
import inquirer from 'inquirer';

import { KunamiBuilderService } from './kunami-builder.service';
import { StateChangeBuilderService } from './state-change-builder.service';

@Repl({
  name: 'Routines',
  type: REPL_TYPE.home,
})
export class RoutineCommandService {
  constructor(
    private readonly promptService: PromptService,
    private readonly kunamiActivate: KunamiBuilderService,
    private readonly stateActivate: StateChangeBuilderService,
  ) {}

  public async build(current: Partial<RoutineDTO> = {}): Promise<RoutineDTO> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current.friendlyName,
    );
    const activate = await this.buildActivations(current.activate);

    return {
      activate,
      friendlyName,
    };
  }

  public async buildActivateEntry(
    current: Partial<RoutineActivateDTO> = {},
  ): Promise<RoutineActivateDTO> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current.friendlyName,
    );
    const type = await this.promptService.pickOne<ROUTINE_ACTIVATE_TYPE>(
      `Activation type`,
      Object.keys(ROUTINE_ACTIVATE_TYPE).map((key) => [TitleCase(key), key]),
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
      case ROUTINE_ACTIVATE_TYPE.schedule:
        return {
          activate: await this.stateActivate.build(
            current.activate as StateChangeActivateDTO,
          ),
          friendlyName,
          type,
        };
    }
    throw new NotImplementedException();
  }

  public async buildActivations(
    activate: RoutineActivateDTO[] = [],
  ): Promise<RoutineActivateDTO[]> {
    const action = await this.promptService.menuSelect([
      ['Add new activation event', 'add'],
      ...this.promptService.conditionalEntries(!IsEmpty(activate), [
        new inquirer.Separator(),
        ...(activate.map((item) => [
          item.friendlyName,
          item,
        ]) as PromptEntry<RoutineActivateDTO>[]),
      ]),
    ]);
    if (action === DONE) {
      return activate;
    }
    if (action === 'add') {
      return await this.buildActivations([
        ...activate,
        await this.buildActivateEntry(),
      ]);
    }
    return activate;
  }

  public async exec(defaultValue?: string): Promise<void> {
    const action = await this.promptService.menuSelect(
      [['Create', 'create'], new inquirer.Separator()],
      undefined,
      defaultValue,
    );
  }
}
