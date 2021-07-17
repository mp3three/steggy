import { Prop, Schema } from '@nestjs/mongoose';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import faker from 'faker';
import { Schema as MongooseSchema, Types } from 'mongoose';

import { MONGO_COLLECTIONS } from '../persistence/mongo';
import { ACTION_METHOD } from '../server';
import { ActionConditionDTO, BaseOmitProperties } from '.';
import { BaseDTO } from './base.dto';
import { ACTION_NAMES, HANDLERS } from './constants';
import { TransformObjectId } from './transform-object-id.decorator';

@Schema({
  collection: MONGO_COLLECTIONS.actions,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class ActionDTO<
  SETTINGS extends Record<never, string> = Record<never, string>,
> extends BaseDTO {
  // #region Public Static Methods

  public static fake(
    mixin: Partial<ActionDTO> = {},
    withID = false,
  ): Omit<ActionDTO, BaseOmitProperties> {
    return {
      ...(withID ? super.fake() : {}),
      form: Types.ObjectId().toHexString(),
      handler: [faker.random.arrayElement(Object.values(HANDLERS))],
      machineName: faker.lorem.slug(3).split('-').join(':'),
      method: [faker.random.arrayElement(Object.values(ACTION_METHOD))],
      name: faker.random.arrayElement(Object.values(ACTION_NAMES)),
      title: faker.lorem.word(8),
      ...mixin,
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  /**
   * Which action to run
   */
  @IsEnum(ACTION_NAMES)
  @Prop({
    enum: ACTION_NAMES,
    required: true,
    type: MongooseSchema.Types.String,
  })
  public name: ACTION_NAMES;
  /**
   * When this action should run
   */
  @IsEnum(HANDLERS, { each: true })
  @Prop({
    required: true,
    type: MongooseSchema.Types.Mixed,
  })
  public handler: HANDLERS[];
  /**
   * Trigger action on methods
   */
  @IsEnum(ACTION_METHOD, { each: true })
  @Prop({
    required: true,
  })
  public method: ACTION_METHOD[];
  @IsNumber()
  @IsOptional()
  @Prop({ default: null })
  public deleted?: number;
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
    ref: MONGO_COLLECTIONS.forms,
    required: true,
    type: MongooseSchema.Types.ObjectId,
  })
  @TransformObjectId()
  public form: string;
  /**
   * User understandable title
   */
  @IsString()
  @Prop({
    index: true,
    required: true,
  })
  public title: string;
  @IsString()
  @Prop()
  @IsOptional()
  public machineName?: string;
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
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public settings?: SETTINGS;

  // #endregion Object Properties
}
