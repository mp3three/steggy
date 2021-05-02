import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseDTO, timestamps } from '.';
import {
  ACTION_CONDITION_EQ,
  ACTION_NAMES,
  HANDLERS,
  HTTP_METHODS,
} from './constants';

/**
 * ActionDTO
 */
@Schema()
export class ActionConditionDTO {
  // #region Object Properties

  /**
   * Equals vs not equals
   */
  @IsEnum(ACTION_CONDITION_EQ)
  @IsOptional()
  @Prop({
    enum: ACTION_CONDITION_EQ,
    type: 'enum',
  })
  public eq?: ACTION_CONDITION_EQ;
  /**
   * Custom javascript or [JSON](https://jsonlogic.com/)
   */
  @IsString()
  @IsOptional()
  @Prop()
  public custom?: string;
  /**
   * Field key
   */
  @IsString()
  @IsOptional()
  @Prop()
  public field?: string;
  /**
   * Comparison value
   */
  @IsString()
  @IsOptional()
  @Prop()
  public value?: string;

  // #endregion Object Properties
}

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
    enum: HANDLERS,
    required: true,
    type: 'enum',
  })
  public handler: HANDLERS[];
  /**
   * Trigger action on methods
   */
  @IsEnum(HTTP_METHODS, { each: true })
  @Prop({
    enum: HTTP_METHODS,
    required: true,
    type: 'enum',
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
  @Prop()
  public condition?: ActionConditionDTO;
  /**
   * Settings provided by specific action
   */
  @ValidateNested()
  @Prop()
  public settings?: SETTINGS;

  // #endregion Object Properties
}
