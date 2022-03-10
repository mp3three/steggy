import { AutoLogService } from '@automagical/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  Repl,
} from '@automagical/tty';

@Repl({
  category: 'Google',
  name: 'Calendar',
})
export class CalendarService {
  constructor(
    private readonly promptService: PromptService,
    private readonly logger: AutoLogService,
    private readonly app: ApplicationManagerService,
  ) {}

  public async exec(): Promise<void> {}
}
