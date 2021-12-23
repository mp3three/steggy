import {
  OrderClass,
  OrderSide,
  OrderStatus,
  OrderTimeInForce,
  OrderType,
} from './enums';

export class ListOrdersOptions {
  public after?: Date;
  public direction?: 'asc' | 'desc';
  public limit?: number;
  public nested?: boolean;
  public status?: 'open' | 'closed' | 'all';
  public symbols?: string[];
  public until?: Date;
}
export class StopLossDTO {
  public limit_price?: number;
  public stop_price: number;
}
export class TakeProfitDTO {
  public limit_price: number;
}
export class PlaceOrderOptions {
  public client_order_id?: string;
  public extended_hours?: boolean;
  public limit_price?: number;
  public notional?: number;
  public order_class?: 'simple' | 'bracket' | 'oco' | 'oto';
  public qty?: number;
  public side: OrderSide;
  public stop_loss?: StopLossDTO;
  public stop_price?: number;
  public symbol: string;
  public take_profit?: { limit_price: number };
  public time_in_force: OrderTimeInForce;
  public trail_percent?: number;
  public trail_price?: number;
  public type: OrderType;
}

export class ReplaceOrderOptions {
  public client_order_id?: string;
  public limit_price?: number;
  public order_id: string;
  public qty?: number;
  public stop_price?: number;
  public time_in_force?: OrderTimeInForce;
}
/**
 * An Order in Alpaca
 */
export class Order {
  /**
   * Asset class
   */
  public asset_class: string;

  /**
   * Asset ID
   */
  public asset_id: string;

  /**
   * When the order was canceled
   */
  public canceled_at: Date;

  /**
   * Client unique order id
   */
  public client_order_id: string;

  /**
   * When the order was created
   */
  public created_at: Date;

  /**
   * When the order expired
   */
  public expired_at: Date;

  /**
   * If true, eligible for execution outside regular trading hours.
   */
  public extended_hours: boolean;

  /**
   * When the order failed
   */
  public failed_at: Date;
  /**
   * When the order was filled
   */
  public filled_at: Date;

  /**
   * Filled average price
   */
  public filled_avg_price: number;

  /**
   * Filled quantity
   */
  public filled_qty: number;

  /**
   * The highest (lowest) market price seen since the trailing stop order was submitted.
   */
  public hwm: number;

  /**
   * Order id
   */
  public id: string;

  /**
   * When querying non-simple order_class orders in a nested style, an array of Order
   * entities associated with this order. Otherwise, null.
   */
  public legs: Order[];
  /**
   * Limit price
   */
  public limit_price: number;

  /**
   * Mostly used for non-simple orders such as bracket, one-triggers-other, or one-cancels-other.
   */
  public order_class: OrderClass;

  /**
   * Ordered quantity
   */
  public qty: number;

  /**
   * When the order was last replaced
   */
  public replaced_at: Date;
  /**
   * The order ID that this order was replaced by
   */
  public replaced_by: string;
  /**
   * The order ID that this order replaces
   */
  public replaces: string;

  /**
   * Buy or sell
   */
  public side: OrderSide;

  /**
   * The status of the order
   */
  public status: OrderStatus;

  /**
   * Stop price
   */
  public stop_price: number;

  /**
   * When the order was submitted
   */
  public submitted_at: Date;

  /**
   * Asset symbol
   */
  public symbol: string;

  /**
   * Order Time in Force
   */
  public time_in_force: OrderTimeInForce;

  /**
   * The percent value away from the high water mark for trailing stop orders.
   */
  public trail_percent: number;

  /**
   * The dollar value away from the high water mark for trailing stop orders.
   */
  public trail_price: number;

  /**
   * Order type (market, limit, stop, stop_limit, trailing_stop)
   */
  public type: OrderType;

  /**
   * When the order was last updated
   */
  public updated_at: Date;
}

/**
 * The parsed result of an order cancelation request.
 */
export class OrderCancelationDTO {
  public id: string;
  public order: Order;
  public status: number;
}
