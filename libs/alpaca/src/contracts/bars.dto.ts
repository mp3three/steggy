export class GetBarsPayloadDTO {
  public adjustment?: 'all' | 'dividend' | 'raw' | 'split';
  public end: Date;
  public limit?: number;
  public page_token?: string;
  public start: Date;
  public timeframe: '1Sec' | '1Min' | '1Hour' | '1Day';
}

/** A bar for a symbol. */
export class Bar {
  /** Bar symbol. */
  public S: string;
  /** Close price. */
  public c: number;
  /** High price. */
  public h: number;
  /** Low price. */
  public l: number;
  /** Open price. */
  public o: number;
  /** Timestamp in Date format. */
  public t: Date;
  /** Volume. */
  public v: number;
}

export class PageOfBarsDTO {
  /** Array of bars. */
  public bars: Bar[];
  /** Token that can be used to query the next page. */
  public next_page_token: string;
  /** Symbol that was queried. */
  public symbol: string;
}
