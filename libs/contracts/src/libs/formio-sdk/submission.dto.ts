import { MONGO_COLLECTIONS } from '@automagical/contracts/constants';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

import { DBFake } from '../../classes';
import { BaseOmitProperties } from '.';
import { AccessDTO } from './Access.dto';
import { SUBMISSION_STATES } from './constants';

@Schema({
  collection: MONGO_COLLECTIONS.submissions,
  minimize: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class SubmissionDTO<
  DATA extends Record<never, unknown> = Record<never, unknown>,
  METADATA extends Record<never, unknown> = Record<never, unknown>
> extends DBFake {
  // #region Public Static Methods

  public static fake(
    mixin: Partial<SubmissionDTO> = {},
    withID = false,
  ): Omit<SubmissionDTO, BaseOmitProperties> {
    return {
      ...(withID ? super.fake() : {}),
      data: {},
      form: Types.ObjectId().toHexString(),
      ...mixin,
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  /**
   * @FIXME: What is this?
   */
  @IsArray()
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public externalIds?: unknown[];
  /**
   * @FIXME: Is this for internal use?
   */
  @IsEnum(SUBMISSION_STATES)
  @IsOptional()
  @Prop({
    enum: SUBMISSION_STATES,
  })
  public state?: SUBMISSION_STATES;
  @IsNumber()
  @IsOptional()
  @Prop({ default: null })
  public deleted?: number;
  @IsString()
  @IsOptional()
  @Prop({
    default: null,
    index: true,
    ref: MONGO_COLLECTIONS.projects,
    type: MongooseSchema.Types.ObjectId,
  })
  public project?: string;
  /**
   * Ties back to ProjectDTO.access
   */
  @IsString({ each: true })
  @IsOptional()
  @Prop({
    index: true,
    ref: MONGO_COLLECTIONS.roles,
    type: MongooseSchema.Types.ObjectId,
  })
  public roles?: string[];
  /**
   * User ID for owner of this entity
   *
   * See Users collection in Portal Base
   */
  @IsString()
  @IsOptional()
  @Prop({
    index: true,
    ref: MONGO_COLLECTIONS.submissions,
  })
  public owner?: string;
  /**
   * Reference to the resource that created this
   */
  @IsString()
  @Prop({
    index: true,
    ref: MONGO_COLLECTIONS.roles,
    required: true,
  })
  public form: string;
  /**
   * Supplemental information for your submission
   */
  @ValidateNested()
  @IsOptional()
  @Prop({
    default: {},
    type: MongooseSchema.Types.Mixed,
  })
  public metadata?: METADATA;
  @ValidateNested()
  @IsOptional()
  @Prop({
    index: true,
  })
  public access?: AccessDTO[];
  /**
   * Your data
   */
  @ValidateNested()
  @Prop({
    required: true,
    type: MongooseSchema.Types.Mixed,
  })
  public data: DATA;

  // #endregion Object Properties
}
