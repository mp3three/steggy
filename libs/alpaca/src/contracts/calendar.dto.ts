/**
 * Contains the time of open and close for a market on a particular day from 1970 to 2029
 */
export class CalendarDTO {
  /**
   * The time the market closes at on this date in HH:MM format
   */
  public close: string;
  /**
   * Date string in YYYY-MM-DD format
   */
  public date: string;

  /**
   * The time the market opens at on this date in HH:MM format
   */
  public open: string;
}
