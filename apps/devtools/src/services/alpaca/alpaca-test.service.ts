import { PromptService, Repl } from '@for-science/tty';

@Repl({
  category: 'Alpaca',
  keybind: 'a',
  name: 'Alpaca Testing',
})
export class AlpacaTestSerivce {
  constructor(private readonly promptService: PromptService) {}
  public async exec(): Promise<void> {
    console.log('hello world');
    await this.promptService.acknowledge();
  }
  //
}
