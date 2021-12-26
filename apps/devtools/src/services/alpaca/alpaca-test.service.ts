import { AccountService } from '@text-based/alpaca';
import { ChartingService, PromptService, Repl } from '@text-based/tty';

@Repl({
  category: 'Alpaca',
  keybind: 'a',
  name: 'Alpaca Testing',
})
export class AlpacaTestSerivce {
  constructor(
    private readonly accountService: AccountService,
    private readonly promptService: PromptService,
    private readonly charting: ChartingService,
  ) {}

  public async exec(): Promise<void> {
    const result = await this.accountService.get();
    console.log(result);
    await this.promptService.acknowledge();
  }
  //
}
