import { Injectable } from '@nestjs/common';
import { RoutineDTO } from '@text-based/controller-logic';
import { OBJECT_BUILDER_ELEMENT, PromptService } from '@text-based/tty';
import { DOWN, FILTER_OPERATIONS, UP } from '@text-based/utilities';

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
            entries: Object.keys(FILTER_OPERATIONS)
              .sort((a, b) => (a > b ? UP : DOWN))
              .map((i) => [i, i]),
          },
          name: 'Type',
          path: 'type',
          type: OBJECT_BUILDER_ELEMENT.enum,
        },
      ],
    });
    return routine;
  }
}
