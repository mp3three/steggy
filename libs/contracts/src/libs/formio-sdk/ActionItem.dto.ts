import {
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseDTO, timestamps } from './Base.dto';
import {
  ACTION_NAMES,
  ACTION_STATES,
  HANDLERS,
  HTTP_METHODS,
} from './constants';

@Schema({
  timestamps,
})
export class ActionItemDTO<
  DATA extends Record<never, string> = Record<never, string>
> extends BaseDTO {
  // #region Object Properties

  @IsEnum(ACTION_STATES)
  @IsOptional()
  @Prop({
    type: 'enum',
    enum: ACTION_STATES,
    default: ACTION_STATES.new,
  })
  public state?: ACTION_STATES;
  @IsEnum(HANDLERS)
  @Prop({
    required: true,
    type: 'enum',
    enum: HANDLERS,
  })
  public handler: HANDLERS;
  @IsEnum(ACTION_NAMES)
  @Prop({
    type: 'enum',
    enum: ACTION_NAMES,
    required: true,
  })
  public action: ACTION_NAMES;
  @IsEnum(HTTP_METHODS)
  @Prop({
    type: 'enum',
    enum: HTTP_METHODS,
    required: true,
  })
  public method: HTTP_METHODS;
  @IsOptional()
  @Prop()
  @ValidateNested()
  public messages?: { type: unknown[] };
  @IsString()
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'form',
    index: true,
    required: true,
  })
  public form: string;
  @IsString()
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'submission',
    index: true,
    required: true,
  })
  public submission: string;
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  @ValidateNested()
  @IsOptional()
  public data?: DATA;
  @Prop({ required: true })
  @IsString()
  public title: string;

  // #endregion Object Properties
}
