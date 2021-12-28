import { AccountService, Order, OrderService } from '@text-based/alpaca';
import { PromptService, Repl } from '@text-based/tty';

@Repl({
  category: 'General',
  name: 'Orders',
})
export class AlpacaOrderService {
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

  public async list(): Promise<Order[]> {
    return await this.orderService.listOrders();
  }
}
