export enum LightingCacheMode {
  /**
   * Circadian lighting controller owns the logic for this device currently
   */
  circadian = 'circadian',
  /**
   * The device is acknowledged as on, but nothing has control currently
   *
   * Perhaps manually turned on via home assistant or some other process
   */
  on = 'on',
}

export class LightingCacheDTO {
  // #region Object Properties

  public brightness: number;
  public kelvin?: number;
  public mode: LightingCacheMode | keyof typeof LightingCacheMode;

  // #endregion Object Properties
}
