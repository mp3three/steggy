import {
  ROUTINE_ACTIVATE_COMMAND,
  RoutineDTO,
} from '@steggy/controller-shared';
import { ApplicationManagerService, PromptService } from '@steggy/tty';
import { DOWN, is, TitleCase, UP } from '@steggy/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoutineCommandBuilderService {
  constructor(
    private readonly promptService: PromptService,
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  public async process(routine: RoutineDTO): Promise<RoutineDTO> {
    this.applicationManager.setHeader(routine.friendlyName);
    routine.command = await this.promptService.objectBuilder({
      current: routine.command,
      elements: [
        {
          name: 'Friendly Name',
          path: 'friendlyName',
          type: 'string',
        },
        {
          extra: {
            entries: Object.keys(ROUTINE_ACTIVATE_COMMAND)
              .sort((a, b) => (a > b ? UP : DOWN))
              .map(i => [TitleCase(i), i]),
          },
          format: (item: string) => (is.string(item) ? TitleCase(item) : item),
          name: 'Type',
          path: 'type',
          type: 'enum',
        },
      ],
    });
    return routine;
  }
}
