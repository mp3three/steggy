import { MONGO_COLLECTIONS } from '@automagical/contracts/constants';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import faker from 'faker';
import { Schema as MongooseSchema, Types } from 'mongoose';

import { DBFake } from '../../classes';
import { BaseOmitProperties } from '.';
import {
  ACTION_NAMES,
  ACTION_STATES,
  HANDLERS,
  HTTP_METHODS,
} from './constants';

@Schema({
  collection: MONGO_COLLECTIONS.actionitems,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class ActionItemDTO<
  DATA extends Record<never, string> = Record<never, string>
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
  @IsNumber()
  @IsOptional()
  @Prop({ default: null })
  public deleted?: number;
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
    ref: MONGO_COLLECTIONS.forms,
    required: true,
    type: MongooseSchema.Types.ObjectId,
  })
  public form: string;
  @IsString()
  @Prop({
    index: true,
    ref: MONGO_COLLECTIONS.submissions,
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
