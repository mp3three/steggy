import { RoutineRestoreCommandDTO } from '@steggy/controller-shared';
import { PromptService } from '@steggy/tty';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RestoreService {
  constructor(private readonly promptService: PromptService) {}

  public async build(
    current: Partial<RoutineRestoreCommandDTO>,
  ): Promise<RoutineRestoreCommandDTO> {
    current.key = await this.promptService.string('Cache key (blank = auto)');
    return current;
  }
}
