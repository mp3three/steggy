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

import { DBFake } from '../../classes';
import { HTTP_METHODS } from '../fetch';
import { MONGO_COLLECTIONS } from '../persistence/mongo';
import { BaseOmitProperties } from '.';
import { ACTION_NAMES, ACTION_STATES, HANDLERS } from './constants';
import { TransformObjectId } from './transform-object-id.decorator';

export type ActionMessage = { type?: unknown[] };

@Schema({
  collection: MONGO_COLLECTIONS.actionitems,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class ActionItemDTO<
  DATA extends Record<never, string> = Record<never, string>,
> extends DBFake {
  // #region Public Static Methods

  public static fake(
    mixin: Partial<ActionItemDTO> = {},
    withID = false,
  ): Omit<ActionItemDTO, BaseOmitProperties> {
    return {
      ...(withID ? super.fake() : {}),
      action: faker.random.arrayElement(Object.values(ACTION_NAMES)),
      form: Types.ObjectId().toHexString(),
      handler: faker.random.arrayElement(Object.values(HANDLERS)),
      method: faker.random.arrayElement(Object.values(HTTP_METHODS)),
      submission: Types.ObjectId().toHexString(),
      title: faker.lorem.word(8),
      ...mixin,
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsEnum(ACTION_STATES)
  @IsOptional()
  @Prop({
    default: ACTION_STATES.new,
    enum: ACTION_STATES,
    type: MongooseSchema.Types.String,
  })
  public state?: ACTION_STATES;
  @IsEnum(ACTION_NAMES)
  @Prop({
    enum: ACTION_NAMES,
    required: true,
    type: MongooseSchema.Types.String,
  })
  public action: ACTION_NAMES;
  @IsEnum(HANDLERS)
  @Prop({
    enum: HANDLERS,
    required: true,
    type: MongooseSchema.Types.String,
  })
  public handler: HANDLERS;
  @IsEnum(HTTP_METHODS)
  @Prop({
    enum: HTTP_METHODS,
    required: true,
    type: MongooseSchema.Types.String,
  })
  public method: HTTP_METHODS;
  @IsNumber()
  @IsOptional()
  @Prop({ default: null })
  public deleted?: number;
  @IsOptional()
  @ValidateNested()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public messages?: ActionMessage | undefined;
  @IsString()
  @Prop({ required: true })
  public title: string;
  @IsString()
  @Prop({
    index: true,
    ref: MONGO_COLLECTIONS.forms,
    required: true,
    type: MongooseSchema.Types.ObjectId,
  })
  @TransformObjectId()
  public form: string;
  @IsString()
  @Prop({
    index: true,
    ref: MONGO_COLLECTIONS.submissions,
    type: MongooseSchema.Types.ObjectId,
    // Current code flows prevent this from actually being required in mongo
    // But for all intents and purposes it should always exist
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
