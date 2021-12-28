import { AccountService, OrderService } from '@text-based/alpaca';
import { PromptService, Repl } from '@text-based/tty';

@Repl({
  category: 'General',
  name: 'Trade',
})
export class TradeService {
  constructor(
    private readonly promptService: PromptService,
    private readonly account: AccountService,
    private readonly orderService: OrderService,
  ) {}

  public async exec(): Promise<void> {
    const action = await this.promptService.menu({
      keyMap: {},
    });
    //
  }
}
