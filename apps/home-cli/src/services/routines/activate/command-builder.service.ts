import { Injectable } from '@nestjs/common';
import {
  ROUTINE_ACTIVATE_COMMAND,
  RoutineDTO,
} from '@text-based/controller-logic';
import { OBJECT_BUILDER_ELEMENT, PromptService } from '@text-based/tty';
import { DOWN, is, TitleCase, UP } from '@text-based/utilities';

@Injectable()
export class RoutineCommandBuilderService {
  constructor(private readonly promptService: PromptService) {}

  public async process(routine: RoutineDTO): Promise<RoutineDTO> {
    this.promptService.clear();
    this.promptService.scriptHeader(routine.friendlyName);
    routine.command = await this.promptService.objectBuilder({
      current: routine.command,
      elements: [
        {
          name: 'Friendly Name',
          path: 'friendlyName',
          type: OBJECT_BUILDER_ELEMENT.string,
        },
        {
          extra: {
            entries: Object.keys(ROUTINE_ACTIVATE_COMMAND)
              .sort((a, b) => (a > b ? UP : DOWN))
              .map((i) => [TitleCase(i), i]),
          },
          format: (item: string) => (is.string(item) ? TitleCase(item) : item),
          name: 'Type',
          path: 'type',
          type: OBJECT_BUILDER_ELEMENT.enum,
        },
      ],
    });
    return routine;
  }
}
