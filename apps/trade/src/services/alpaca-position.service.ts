import { AccountService, OrderService, Position } from '@text-based/alpaca';
import { PromptService, Repl } from '@text-based/tty';

@Repl({
  category: 'General',
  name: 'Positions',
})
export class AlpacaPositionService {
  constructor(
    private readonly promptService: PromptService,
    private readonly account: AccountService,
    private readonly orderService: OrderService,
  ) {}

  public async exec(): Promise<void> {
    console.log(await this.list());
    await this.promptService.acknowledge();
    // const action = await this.promptService.menu({
    //   keyMap: {},
    // });
  }

  public async list(): Promise<Position[]> {
    return await this.orderService.listPositions();
  }
}
