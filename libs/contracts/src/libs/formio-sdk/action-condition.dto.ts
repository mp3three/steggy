import { Prop, Schema } from '@nestjs/mongoose';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ACTION_CONDITION_EQ } from './constants';

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
