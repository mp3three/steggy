export class BlessedThemeDTO {
  // #region Object Properties

  public colors: Record<string, unknown>;
  public header: {
    border: Record<'bg' | 'fg' | 'type', string> & { type: 'line' };
    style: Record<'bg' | 'fg', string>;
  };
  public program: Record<'bg' | 'fg', string>;

  // #endregion Object Properties
}
export const BLESSED_THEME = Symbol('BLESSED_THEME');
