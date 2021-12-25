/**
 * The clock API serves the current market timestamp, whether or not the market is
 * currently open, as well as the times of the next market open and close.
 */
export class ClockDTO {
  /**
   * Whether or not the market is open
   */
  public is_open: boolean;

  /**
   * Next market close timestamp
   */
  public next_close: Date;

  /**
   * Next market open timestamp
   */
  public next_open: Date;
  /**
   * Current timestamp
   */
  public timestamp: Date;
}
