export class DailyBar {
  public c: number;
  public h: number;
  public l: number;
  public o: number;
  public t: Date;
  public v: number;
}
export class LatestQuote {
  public ap: number;
  public as: number;
  public ax: string;
  public bp: number;
  public bs: number;
  public bx: string;
  public c?: string[] | null;
  public t: Date;
}
export class LatestTrade {
  public c?: string[] | null;
  public i: number;
  public p: number;
  public s: number;
  public t: Date;
  public x: string;
  public z: string;
}
export class MinuteBar {
  public c: number;
  public h: number;
  public l: number;
  public o: number;
  public t: Date;
  public v: number;
}
export class PreviousDailyBar {
  public c: number;
  public h: number;
  public l: number;
  public o: number;
  public t: Date;
  public v: number;
}

export class SnapshotDTO {
  public dailyBar: DailyBar;
  public latestQuote: LatestQuote;
  public latestTrade: LatestTrade;
  public minuteBar: MinuteBar;
  public prevDailyBar: PreviousDailyBar;
  public symbol: string;
}
