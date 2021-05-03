import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseDTO, timestamps } from '.';

@Schema({
  minimize: false,
  timestamps,
})
export class TagDTO<
  TEMPLATE extends Record<never, unknown> = Record<string, unknown>
> extends BaseDTO {
  // #region Object Properties

  @IsString()
  @MaxLength(32)
  @Prop({
    maxlength: 32,
    required: true,
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
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public template: TEMPLATE;

  // #endregion Object Properties
}
