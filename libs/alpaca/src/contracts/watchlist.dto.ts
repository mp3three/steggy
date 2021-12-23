import { AssetDTO } from './assset.dto';

export class Watchlist {
  /**
   * account ID
   */
  account_id: string;

  /**
   * the content of this watchlist, in the order as registered by the client
   */
  assets: AssetDTO[];

  /**
   * When the watchlist was created
   */
  created_at: string;

  /**
   * watchlist id
   */
  id: string;

  /**
   * user-defined watchlist name (up to 64 characters)
   */
  name: string;

  /**
   * When the watchlist was last updated
   */
  updated_at: string;
}
