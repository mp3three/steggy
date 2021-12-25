import { AssetExchange, AssetStatus } from './enums';

/**
 * The assets API serves as the main list of assets available for trade and data
 * consumption from Alpaca. Assets are sorted by asset class, exchange and symbol. Some
 * assets are only available for data consumption via Polygon, and are not tradable with
 * Alpaca. These assets will be marked with the flag tradable=false.
 */
export class AssetDTO {
  /**
   * "us_equity"
   */
  public class: string;

  /**
   * Asset is easy-to-borrow or not (filtering for easy_to_borrow = True is the best way
   * to check whether the name is currently available to short at Alpaca).
   */
  public easy_to_borrow: boolean;

  /**
   * AMEX, ARCA, BATS, NYSE, NASDAQ or NYSEARCA
   */
  public exchange: AssetExchange;

  /**
   * Asset is fractionable or not.
   */
  public fractionable: boolean;
  /**
   * Asset ID
   */
  public id: string;

  /**
   * Asset is marginable or not
   */
  public marginable: boolean;

  /**
   * Asset is shortable or not
   */
  public shortable: boolean;
  /**
   * active or inactive
   */
  public status: AssetStatus;

  /**
   * Asset symbol
   */
  public symbol: string;

  /**
   * Asset is tradable on Alpaca or not
   */
  public tradable: boolean;
}

export interface AssetOptions {
  asset_class?: string; // i don't know where to find all asset classes
  status?: 'active' | 'inactive';
}
