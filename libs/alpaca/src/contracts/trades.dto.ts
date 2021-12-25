export class GetTrades {
  public end: Date;
  public limit?: number;
  public page_token?: string;
  public start: Date;
}

/** A trade which occurred. */
export class Trade {
  /** Trade symbol. */
  public S: string;
  /** Trade conditions. */
  public c: string[];
  /** Trade ID. */
  public i: number;
  /** Trade price. */
  public p: number;
  /** Trade size. */
  public s: number;
  /** Timestamp in RFC-3339 format with nanosecond precision. */
  public t: Date;
  /** Exchange where the trade happened. */
  public x: string;
  /** Tape. */
  public z: string;
}

/** A page of one or many trades. */
export class PageOfTradesDTO {
  /** Token that can be used to query the next page. */
  public next_page_token: string;
  /** Symbol that was queried. */
  public symbol: string;
  /** Array of trades. */
  public trades: Trade[];
}
