export enum LightingCacheMode {
  circadian = 'circadian',
  on = 'on',
  paused = 'paused',
}

export class LightingCacheDTO {
  // #region Object Properties

  public brightness: number;
  public kelvin?: number;
  public mode: LightingCacheMode | keyof typeof LightingCacheMode;

  // #endregion Object Properties
}
