import {
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseDTO, timestamps } from '.';
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
    default: ACTION_STATES.new,
    enum: ACTION_STATES,
    type: 'enum',
  })
  public state?: ACTION_STATES;
  @IsEnum(HANDLERS)
  @Prop({
    enum: HANDLERS,
    required: true,
    type: 'enum',
  })
  public handler: HANDLERS;
  @IsEnum(ACTION_NAMES)
  @Prop({
    enum: ACTION_NAMES,
    required: true,
    type: 'enum',
  })
  public action: ACTION_NAMES;
  @IsEnum(HTTP_METHODS)
  @Prop({
    enum: HTTP_METHODS,
    required: true,
    type: 'enum',
  })
  public method: HTTP_METHODS;
  @IsOptional()
  @Prop()
  @ValidateNested()
  public messages?: { type: unknown[] };
  @IsString()
  @Prop({
    index: true,
    ref: 'form',
    required: true,
    type: MongooseSchema.Types.ObjectId,
  })
  public form: string;
  @IsString()
  @Prop({
    index: true,
    ref: 'submission',
    required: true,
    type: MongooseSchema.Types.ObjectId,
  })
  public submission: string;
  /**
   * Complex data provided by caller
   */
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
