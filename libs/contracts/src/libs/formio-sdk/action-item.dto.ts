import {
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { timestamps } from '.';
import { BaseDTO } from './base.dto';
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
  })
  public state?: ACTION_STATES;
  @IsEnum(ACTION_NAMES)
  @Prop({
    enum: ACTION_NAMES,
    required: true,
  })
  public action: ACTION_NAMES;
  @IsEnum(HANDLERS)
  @Prop({
    enum: HANDLERS,
    required: true,
  })
  public handler: HANDLERS;
  @IsEnum(HTTP_METHODS)
  @Prop({
    enum: HTTP_METHODS,
    required: true,
  })
  public method: HTTP_METHODS;
  @IsOptional()
  @ValidateNested()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public messages?: { type: unknown[] };
  @IsString()
  @Prop({ required: true })
  public title: string;
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
  @ValidateNested()
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public data?: DATA;

  // #endregion Object Properties
}
