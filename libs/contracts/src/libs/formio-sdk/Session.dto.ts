import {
  IsDate,
  IsObjectId,
  IsOptional,
  IsString,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDTO, timestamps } from '.';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({
  minimize: false,
  timestamps,
})
export class SessionDTO extends BaseDTO {
  // #region Object Properties

  @IsObjectId()
  @Prop({ ref: 'form', required: true, index: true })
  public form: string;
  @IsObjectId()
  @Prop({ ref: 'submission', required: true, index: true })
  public submission: string;
  @IsOptional()
  @IsDate()
  @Prop()
  public logout?: Date;
  @IsOptional()
  @IsString()
  @Prop()
  public source?: string;
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
