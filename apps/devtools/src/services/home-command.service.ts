import { iRepl, Repl } from '@automagical/tty';
import { AutoLogService, Trace } from '@automagical/utilities';

@Repl({
  name: 'Home Command',
})
export class HomeCommandService implements iRepl {
  constructor(private readonly logger: AutoLogService) {}

  @Trace()
  public async exec(): Promise<void> {
    //
  }
}
