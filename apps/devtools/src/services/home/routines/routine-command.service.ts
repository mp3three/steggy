import {
  ROUTINE_ACTIVATE_TYPE,
  RoutineActivateDTO,
  RoutineDTO,
  StateChangeActivateDTO,
} from '@automagical/controller-logic';
import { PromptService, Repl, REPL_TYPE } from '@automagical/tty';
import { TitleCase } from '@automagical/utilities';
import { NotImplementedException } from '@nestjs/common';
import inquirer from 'inquirer';

import { StateChangeBuilderService } from './state-change-builder.service';

@Repl({
  name: 'Routines',
  type: REPL_TYPE.home,
})
export class RoutineCommandService {
  constructor(
    private readonly promptService: PromptService,
    private readonly stateActivate: StateChangeBuilderService,
  ) {}

  public async build(current: Partial<RoutineDTO> = {}): Promise<RoutineDTO> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current.friendlyName,
    );
    const activate: RoutineActivateDTO[] = [];
    let counter = -1;
    let addMore = true;
    current.activate ??= [];
    do {
      counter++;
      if (current.activate[counter]) {
        if (
          await this.promptService.confirm(
            `Update ${current.activate[counter].friendlyName}`,
          )
        ) {
          //
        }
        continue;
      }
      addMore = false;
    } while (addMore);

    return {
      friendlyName,
    };
  }

  public async buildActivate(
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
        return;
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

  public async exec(defaultValue?: string): Promise<void> {
    const action = await this.promptService.menuSelect(
      [['Create', 'create'], new inquirer.Separator()],
      undefined,
      defaultValue,
    );
  }
}
