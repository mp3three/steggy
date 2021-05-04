import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { ActionConditionDTO, timestamps } from '.';
import { BaseDTO } from './base.dto';
import { ACTION_NAMES, HANDLERS, HTTP_METHODS } from './constants';

@Schema({
  timestamps,
})
export class ActionDTO<
  SETTINGS extends Record<never, string> = Record<never, string>
> extends BaseDTO {
  // #region Object Properties

  /**
   * Which action to run
   */
  @IsEnum(ACTION_NAMES)
  public name: ACTION_NAMES;
  /**
   * When this action should run
   */
  @IsEnum(HANDLERS, { each: true })
  @Prop({
    required: true,
  })
  public handler: HANDLERS[];
  /**
   * Trigger action on methods
   */
  @IsEnum(HTTP_METHODS, { each: true })
  @Prop({
    required: true,
  })
  public method: HTTP_METHODS[];
  /**
   * FIXME: What is this? Can controlled on the UI? Which direction is it sorted?
   */
  @IsNumber()
  @IsOptional()
  @Prop({
    default: 0,
    index: true,
  })
  public priority?: number;
  @IsString()
  @IsOptional()
  @Prop({
    index: true,
    ref: 'form',
    required: true,
    type: MongooseSchema.Types.ObjectId,
  })
  public form: string;
  @IsString()
  @Prop()
  public machineName: string;
  /**
   * User understandable title
   */
  @IsString()
  @Prop({
    index: true,
    required: true,
  })
  public title: string;
  /**
   * Conditionals to prevent running the action from running
   */
  @ValidateNested()
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public condition?: ActionConditionDTO;
  /**
   * Settings provided by specific action
   */
  @ValidateNested()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public settings?: SETTINGS;

  // #endregion Object Properties
}
