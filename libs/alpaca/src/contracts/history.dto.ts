export class GetPortfolioHistory {
  public date_end?: Date;
  public extended_hours?: boolean;
  public period?: string;
  public timeframe?: string;
}

/**
 * Timeseries data for equity and profit loss information of the account
 */
export class PortfolioHistoryDTO {
  /**
   * basis in dollar of the profit loss calculation
   */
  public base_value: number;

  /**
   * equity value of the account in dollar amount as of the end of each time window
   */
  public equity: number[];

  /**
   * profit/loss in dollar from the base value
   */
  public profit_loss: number[];

  /**
   * profit/loss in percentage from the base value
   */
  public profit_loss_pct: number[];
  /**
   * time window size of each data element
   */
  public timeframe: string;
  /**
   * time of each data element, left-labeled (the beginning of time window)
   */
  public timestamp: number[];
}
