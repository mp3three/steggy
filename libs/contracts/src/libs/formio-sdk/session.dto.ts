import { IsDate, IsOptional, IsString } from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseDTO, timestamps } from '.';

@Schema({
  minimize: false,
  timestamps,
})
export class SessionDTO extends BaseDTO {
  // #region Object Properties

  @IsOptional()
  @IsDate()
  @Prop()
  public logout?: Date;
  @IsOptional()
  @IsString()
  @Prop()
  public source?: string;
  @IsString()
  @Prop({ index: true, ref: 'form', required: true })
  public form: string;
  @IsString()
  @Prop({ index: true, ref: 'submission', required: true })
  public submission: string;
  @Prop({
    default: null,
    index: true,
    ref: 'project',
    required: true,
    type: MongooseSchema.Types.ObjectId,
  })
  public project?: string;

  // #endregion Object Properties
}
