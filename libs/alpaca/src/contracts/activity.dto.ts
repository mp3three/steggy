import { ActivityType } from './enums';

export class GetAccountActivities {
  public activity_type?: string;
  public activity_types?: string | string[];
  public after?: string;
  public date?: string;
  public direction?: 'asc' | 'desc';
  public page_size?: number;
  public page_token?: string;
  public until?: string;
}

export type TradeActivityType = 'fill' | 'partial_fill';
export type TradeActivitySide = 'buy' | 'sell';
export type Activity = TradeActivity | NonTradeActivity;

export class TradeActivity {
  /**
   * FILL
   */
  public activity_type: Extract<ActivityType, 'FILL'>;

  /**
   * The cumulative quantity of shares involved in the execution.
   */
  public cum_qty: number;

  /**
   * An id for the activity. Always in "::" format. Can be sent as page_token in requests
   * to facilitate the paging of results.
   */
  public id: string;

  /**
   * For partially_filled orders, the quantity of shares that are left to be filled.
   */
  public leaves_qty: number;

  /**
   * The id for the order that filled.
   */
  public order_id: string;

  /**
   * The per-share price that the trade was executed at.
   */
  public price: number;

  /**
   * The number of shares involved in the trade execution.
   */
  public qty: number;

  /**
   * buy or sell
   */
  public side: TradeActivitySide;

  /**
   * The symbol of the security being traded.
   */
  public symbol: string;

  /**
   * The time at which the execution occurred.
   */
  public transaction_time: string;

  /**
   * fill or partial_fill
   */
  public type: TradeActivityType;
}

export class NonTradeActivity {
  /**
   * Activity type
   */
  public activity_type: Exclude<ActivityType, 'FILL'>;

  /**
   * The date on which the activity occurred or on which the transaction associated with
   * the activity settled.
   */
  public date: string;

  /**
   * An ID for the activity, always in "::" format. Can be sent as page_token in requests
   * to facilitate the paging of results.
   */
  public id: string;

  /**
   * The net amount of money (positive or negative) associated with the activity.
   */
  public net_amount: number;

  /**
   * For dividend activities, the average amount paid per share. Not present for other
   * activity types.
   */
  public per_share_amount: number;

  /**
   * For dividend activities, the number of shares that contributed to the payment. Not
   * present for other activity types.
   */
  public qty: number;

  /**
   * The symbol of the security involved with the activity. Not present for all activity
   * types.
   */
  public symbol: string;
}
