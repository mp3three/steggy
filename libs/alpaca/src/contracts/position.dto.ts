import { PositionSide } from './enums';

/**
 * A position in Alpaca
 */
export class Position {
  /**
   * Asset class name
   */
  asset_class: string;
  /**
   * Asset ID
   */
  asset_id: string;
  /**
   * Average entry price of the position
   */
  avg_entry_price: number;

  /**
   * Percent change from last day price (by a factor of 1)
   */
  change_today: number | null;

  /**
   * Total cost basis in dollar
   */
  cost_basis: number;

  /**
   * Current asset price per share
   */
  current_price: number | null;
  /**
   * Exchange name of the asset
   */
  exchange: string;

  /**
   * Last day's asset price per share based on the closing value of the last trading day
   */
  lastday_price: number | null;

  /**
   * Total dollar amount of the position
   */
  market_value: number | null;
  /**
   * The number of shares
   */
  qty: number;

  /**
   * long or short
   */
  side: PositionSide;
  /**
   * Symbol name of the asset
   */
  symbol: string;

  /**
   * Unrealized profit/loss in dollars for the day
   */
  unrealized_intraday_pl: number | null;

  /**
   * Unrealized profit/loss percent (by a factor of 1)
   */
  unrealized_intraday_plpc: number | null;

  /**
   * Unrealized profit/loss in dollars
   */
  unrealized_pl: number | null;

  /**
   * Unrealized profit/loss percent (by a factor of 1)
   */
  unrealized_plpc: number | null;
}
