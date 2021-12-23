export class AccountConfigurationsDTO {
  /**
   * both, entry, or exit. Controls Day Trading Margin Call (DTMC) checks.
   */
  public dtbp_check: 'both' | 'entry' | 'exit';

  /**
   * If true, account becomes long-only mode.
   */
  public no_shorting: boolean;

  /**
   * If true, new orders are blocked.
   */
  public suspend_trade: boolean;

  /**
   * all or none. If none, emails for order fills are not sent.
   */
  public trade_confirm_email: 'all' | 'none';
}
