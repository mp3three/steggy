import { PromptService } from '@automagical/tty';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ScheduleBuilderService {
  constructor(private readonly promtService: PromptService) {}
}
