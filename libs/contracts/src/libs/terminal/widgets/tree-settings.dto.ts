import { Transform } from 'class-transformer';

export class TreeWidgetSettingsDTO {
  // #region Object Properties

  @Transform(({ value }) => value ?? ' [+]')
  public extend?: string;
  @Transform(({ value }) => value ?? ['+', 'space', 'enter'])
  public keys?: string[];
  @Transform(({ value }) => value ?? ' [-]')
  public retract?: string;

  // #endregion Object Properties
}
