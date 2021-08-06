export class RoomStateDTO {
  // #region Object Properties

  public activeFlags: string[];
  public lightingMode: 'circadian' | 'unmanaged';
  public lights: Record<string, Record<'temperature' | 'brightness', number>>;

  // #endregion Object Properties
}
