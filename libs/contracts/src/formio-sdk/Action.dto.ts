import {
  IsEnum,
  IsNumber,
  IsObjectId,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseDTO, timestamps } from './Base.dto';
import {
  ACTION_CONDITION_EQ,
  ActionNames,
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
    type: 'enum',
    enum: ACTION_CONDITION_EQ,
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
  @IsEnum(ActionNames)
  public name: ActionNames;
  /**
   * When this action should run
   */
  @IsEnum(HANDLERS, { each: true })
  @Prop({
    type: 'enum',
    enum: HANDLERS,
    required: true,
  })
  public handler: HANDLERS[];
  /**
   * Trigger action on methods
   */
  @IsEnum(HTTP_METHODS, { each: true })
  @Prop({
    type: 'enum',
    enum: HTTP_METHODS,
    required: true,
  })
  public method: HTTP_METHODS[];
  /**
   * FIXME: What is this? Can it be set on the UI? Which direction is it sorted?
   */
  @IsNumber()
  @IsOptional()
  @Prop({
    index: true,
    default: 0,
  })
  public priority?: number;
  /**
   * Resource reference to the form this is attached to
   *
   * TODO: This probably should be `resource`
   */
  @IsObjectId()
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'form',
    index: true,
    required: true,
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
