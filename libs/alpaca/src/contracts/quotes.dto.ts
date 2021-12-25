export class GetQuotes {
  public end: Date;
  public limit?: number;
  public page_token?: string;
  public start: Date;
}

/** A quote for a symbol. */
export class Quote {
  /** Quote symbol. */
  public S: string;
  /** Ask price. */
  public ap: number;
  /** Ask size. */
  public as: number;
  /** Ask exchange. */
  public ax: string;
  /** Bid price. */
  public bp: number;
  /** Bid size. */
  public bs: number;
  /** Bid exchange. */
  public bx: string;
  /** Quote conditions. */
  public c: string[];
  /** Timestamp in Date format. */
  public t: Date;
}

/** A page of one or many quotes. */
export class PageOfQuotesDTO {
  /** Token that can be used to query the next page. */
  public next_page_token: string;
  /** Array of quotes. */
  public quotes: Quote[];
  /** Symbol that was queried. */
  public symbol: string;
}
