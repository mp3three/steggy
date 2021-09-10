import { Transform } from 'class-transformer';

export class TreeWidgetSettingsDTO {
  

  @Transform(({ value }) => value ?? ' [+]')
  public extend?: string;
  @Transform(({ value }) => value ?? ['+', 'space', 'enter'])
  public keys?: string[];
  @Transform(({ value }) => value ?? ' [-]')
  public retract?: string;

  
}
