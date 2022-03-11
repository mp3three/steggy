import { Prop } from '@nestjs/mongoose';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ActionConditionDTO } from './action-condition.dto';
import { BaseDTO } from './base.dto';
import { ACTION_NAMES, HANDLERS } from './constants';
import { TransformObjectId } from './transform-object-id.decorator';

export class ActionDTO<
  SETTINGS extends Record<never, string> = Record<never, string>,
> extends BaseDTO {
  /**
   * Conditionals to prevent running the action from running
   */
  @ValidateNested()
  @IsOptional()
  public condition?: ActionConditionDTO;
  @IsString()
  @IsOptional()
  @TransformObjectId()
  public form: string;
  /**
   * When this action should run
   */
  @IsEnum(HANDLERS, { each: true })
  public handler: HANDLERS[];
  @IsString()
  @Prop()
  @IsOptional()
  public machineName?: string;
  /**
   * Trigger action on methods
   */
  @IsString()
  @Prop({
    required: true,
  })
  public method: string[];
  /**
   * Which action to run
   */
  @IsEnum(ACTION_NAMES)
  public name: ACTION_NAMES;
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
  /**
   * Settings provided by specific action
   */
  @ValidateNested()
  @IsOptional()
  public settings?: SETTINGS;
  /**
   * User understandable title
   */
  @IsString()
  @Prop({
    index: true,
    required: true,
  })
  public title: string;
}
