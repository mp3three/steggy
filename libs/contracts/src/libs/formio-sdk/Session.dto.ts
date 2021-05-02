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
  @Prop({ ref: 'form', required: true, index: true })
  public form: string;
  @IsString()
  @Prop({ ref: 'submission', required: true, index: true })
  public submission: string;
  @Prop({
    ref: 'project',
    type: MongooseSchema.Types.ObjectId,
    index: true,
    required: true,
    default: null,
  })
  public project?: string;

  // #endregion Object Properties
}
