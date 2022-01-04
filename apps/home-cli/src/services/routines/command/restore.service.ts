import { RoutineRestoreCommandDTO } from '@text-based/controller-logic';
import { PromptService } from '@text-based/tty';

import { RoutineCommand } from '../../../decorators';

@RoutineCommand({
  type: 'restore',
})
export class RestoreService {
  constructor(private readonly promptService: PromptService) {}

  public async build(
    current: Partial<RoutineRestoreCommandDTO>,
  ): Promise<RoutineRestoreCommandDTO> {
    current.key = await this.promptService.string('Cache key (blank = auto)');
    return current;
  }
}
