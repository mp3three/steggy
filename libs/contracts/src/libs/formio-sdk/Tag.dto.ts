import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDTO, timestamps } from '.';

@Schema({
  timestamps,
  minimize: false,
})
export class TagDTO<
  TEMPLATE extends Record<never, unknown> = Record<string, unknown>
> extends BaseDTO {
  // #region Object Properties

  @IsString()
  @MaxLength(32)
  @Prop({
    required: true,
    maxlength: 32,
  })
  public tag: string;
  @MaxLength(256)
  @IsString()
  @Prop({
    maxlength: 256,
  })
  @IsOptional()
  public description?: string;
  @ValidateNested()
  @Prop()
  public template: TEMPLATE;

  // #endregion Object Properties
}
