import { AccountService, AccountStatus } from '@text-based/alpaca';
import { IsDone, PromptService, Repl, ToMenuEntry } from '@text-based/tty';
import { is, TitleCase } from '@text-based/utilities';
import chalk from 'chalk';

@Repl({
  category: 'General',
  keybind: 'a',
  name: 'Account',
})
export class AlpacaAccountService {
  constructor(
    private readonly accountService: AccountService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(value?: string): Promise<void> {
    await this.header();
    const action = await this.promptService.menu({
      keyMap: { d: ['Done', 'done'], n: ['Show account number', 'number'] },
      keyMapCallback: async (action) => {
        if (action === 'number') {
          const account = await this.accountService.get();
          return chalk`  {bold.cyan Account number:} ${account.account_number}`;
        }
        return true;
      },
      right: ToMenuEntry([
        ['Get Account', 'get'],
        ['Activities', 'activities'],
        ['Configurations', 'configurations'],
        ['History', 'history'],
        ['Assets', 'assets'],
      ]),
      value,
    });
    if (IsDone(action)) {
      return;
    }
    let result: unknown;
    switch (action) {
      case 'get':
        result = await this.accountService.get();
        break;
      case 'activities':
        result = await this.accountService.getActivities({});
        break;
      case 'configurations':
        result = await this.accountService.getConfigurations();
        break;
      case 'history':
        result = await this.accountService.history({});
        break;
      case 'assets':
        await this.listAssets();
        return await this.exec(action);
    }
    console.log(result);
    await this.promptService.acknowledge();
  }

  private async header(): Promise<void> {
    const account = await this.accountService.get();
    this.promptService.scriptHeader(
      'Account',
      account.status === AccountStatus.ACTIVE ? 'green' : 'yellow',
    );
    if (account.account_blocked) {
      this.promptService.secondaryHeader('Account blocked');
      return;
    }
    this.promptService.secondaryHeader(
      `Buying power: $${Number(account.buying_power).toLocaleString()}`,
    );
    if (account.transfers_blocked) {
      console.log(chalk`  {red.bold Transfers blocked}`);
    }
    if (account.trading_blocked) {
      console.log(chalk.bold.yellow`  Trading blocked`);
    }
    if (account.trade_suspended_by_user) {
      this.promptService.secondaryHeader('Suspended Trading');
      console.log(chalk.yellow`  Trading suspended by user`);
      return;
    }
    if (account.pattern_day_trader) {
      console.log(chalk.yellow`  Warning: Pattern Day Trader`);
    }
    console.log(chalk.cyan`  {bold Currency: }${account.currency}`);
    if (account.shorting_enabled) {
      console.log(chalk.green`  Shorting enabled`);
    } else {
      console.log(chalk.yellow`  Shorting disabled`);
    }
    console.log(
      chalk.cyan`  {bold Crypto status: }${TitleCase(
        account.crypto_status.toLowerCase(),
      )}`,
    );

    console.log();
  }

  private async listAssets(): Promise<void> {
    const result = await this.accountService.listAssets();
    console.log(is.unique(result.map((i) => i)));
    // console.log(result);
    await this.promptService.acknowledge();
  }
}
// AccountDTO {
//   buying_power: '5',
//   cash: '5',
//   created_at: '2021-12-22T22:31:24.248352Z',
//   daytrade_count: 0,
//   daytrading_buying_power: '0',
//   equity: '5',
//   initial_margin: '0',
//   last_equity: '5',
//   last_maintenance_margin: '0',
//   long_market_value: '0',
//   maintenance_margin: '0',
//   multiplier: '1',
//   pattern_day_trader: false,
//   portfolio_value: '5',
//   regt_buying_power: '5',
//   short_market_value: '0',
//   sma: '5',
//   non_marginable_buying_power: '5',
//   accrued_fees: '0',
//   pending_transfer_in: '0'
// }
