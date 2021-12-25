import { AccountStatus } from './enums';
// The useful comments in this file are not mine
// https://github.com/117/alpaca

// export class RawAccountDTO {
//   public account_blocked: boolean;
//   public account_number: string;
//   public buying_power: string;
//   public cash: string;
//   public created_at: string;
//   public currency: string;
//   public daytrade_count: number;
//   public daytrading_buying_power: string;
//   public equity: string;
//   public id: string;
//   public initial_margin: string;
//   public last_equity: string;
//   public last_maintenance_margin: string;
//   public long_market_value: string;
//   public maintenance_margin: string;
//   public multiplier: string;
//   public pattern_day_trader: boolean;
//   public portfolio_value: string;
//   public regt_buying_power: string;
//   public short_market_value: string;
//   public shorting_enabled: boolean;
//   public sma: string;
//   public status: string;
//   public trade_suspended_by_user: boolean;
//   public trading_blocked: boolean;
//   public transfers_blocked: boolean;
// }

/**
 * Information related to an Alpaca account, such as account status, funds, and various
 * flags relevant to an account's ability to trade.
 */
export class AccountDTO {
  /**
   * If true, the account activity by user is prohibited.
   */
  public account_blocked: boolean;

  /**
   * Account number.
   */
  public account_number: string;

  /**
   * Current available $ buying power; If multiplier = 4, this is your daytrade buying
   * power which is calculated as (last_equity - (last) maintenance_margin) * 4; If
   * multiplier = 2, buying_power = max(equity – initial_margin,0) * 2; If multiplier = 1,
   * buying_power = cash
   */
  public buying_power: number;

  /**
   * Cash balance
   */
  public cash: number;

  /**
   * Timestamp this account was created at
   */
  public created_at: Date;

  /**
   * "USD"
   */
  public currency: string;

  /**
   * The current number of daytrades that have been made in the last 5 trading days
   * (inclusive of today)
   */
  public daytrade_count: number;

  /**
   * Your buying power for day trades (continuously updated value)
   */
  public daytrading_buying_power: number;

  /**
   * Cash + long_market_value + short_market_value
   */
  public equity: number;

  /**
   * Account ID.
   */
  public id: string;

  /**
   * Reg T initial margin requirement (continuously updated value)
   */
  public initial_margin: number;

  /**
   * Equity as of previous trading day at 16:00:00 ET
   */
  public last_equity: number;

  /**
   * Your maintenance margin requirement on the previous trading day
   */
  public last_maintenance_margin: number;

  /**
   * Real-time MtM value of all long positions held in the account
   */
  public long_market_value: number;

  /**
   * Maintenance margin requirement (continuously updated value)
   */
  public maintenance_margin: number;

  /**
   * Buying power multiplier that represents account margin classification; valid values 1
   * (standard limited margin account with 1x buying power), 2 (reg T margin account with
   * 2x intraday and overnight buying power; this is the default for all non-PDT accounts
   * with $2,000 or more equity), 4 (PDT account with 4x intraday buying power and 2x reg
   * T overnight buying power)
   */
  public multiplier: number;

  /**
   * Whether or not the account has been flagged as a pattern day trader
   */
  public pattern_day_trader: boolean;

  /**
   * Total value of cash + holding positions (This field is deprecated. It is equivalent
   * to the equity field.)
   */
  public portfolio_value: number;

  /**
   * Your buying power under Regulation T (your excess equity - equity minus margin
   * value - times your margin multiplier)
   */
  public regt_buying_power: number;

  /**
   * Real-time MtM value of all short positions held in the account
   */
  public short_market_value: number;

  /**
   * Flag to denote whether or not the account is permitted to short
   */
  public shorting_enabled: boolean;

  /**
   * Value of special memorandum account (will be used at a later date to provide
   * additional buying_power)
   */
  public sma: number;

  /**
   * The following are the possible account status values. Most likely, the account status
   * is ACTIVE unless there is any problem. The account status may get in ACCOUNT_UPDATED
   * when personal information is being updated from the dashboard, in which case you may
   * not be allowed trading for a short period of time until the change is approved.
   */
  public status: AccountStatus;

  /**
   * User setting. If true, the account is not allowed to place orders.
   */
  public trade_suspended_by_user: boolean;

  /**
   * If true, the account is not allowed to place orders.
   */
  public trading_blocked: boolean;

  /**
   * If true, the account is not allowed to request money transfers.
   */
  public transfers_blocked: boolean;
}
