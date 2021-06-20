import { MONGO_COLLECTIONS } from '@automagical/contracts/constants';
import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Schema as MongooseSchema, Types } from 'mongoose';

import { DBFake } from '../../classes';
import { BaseOmitProperties } from '.';
import { AccessDTO } from './Access.dto';
import { SUBMISSION_STATES } from './constants';
import { TransformObjectId } from './transform-object-id.decorator';

export class ExternalSubmissionIdDTO {
  // #region Object Properties

  public id: string;
  public resource?: string;
  public type?: 'resource' | string;

  // #endregion Object Properties
}

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
  METADATA extends Record<never, unknown> = Record<never, unknown>,
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
   * @FIXME: Is this for internal use?
   */
  @ApiProperty({
    enum: SUBMISSION_STATES,
  })
  @IsEnum(SUBMISSION_STATES)
  @IsOptional()
  @Prop({
    enum: SUBMISSION_STATES,
    type: MongooseSchema.Types.String,
  })
  public state?: SUBMISSION_STATES;
  /**
   * @FIXME: What is this?
   */
  @IsArray()
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  @ApiProperty({
    readOnly: true,
  })
  public externalIds?: ExternalSubmissionIdDTO[];
  @IsNumber()
  @IsOptional()
  @Prop({ default: null })
  @ApiProperty({
    readOnly: true,
  })
  public deleted?: number;
  @IsString()
  @IsOptional()
  @Prop({
    default: null,
    index: true,
    ref: MONGO_COLLECTIONS.projects,
    type: MongooseSchema.Types.ObjectId,
  })
  @ApiProperty({})
  @TransformObjectId()
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
  @ApiProperty()
  @TransformObjectId()
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
  @ApiProperty()
  @TransformObjectId()
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
  @ApiProperty()
  @TransformObjectId()
  public form: string;
  /**
   * Your data
   */
  @ValidateNested()
  @IsDefined()
  @Prop({
    required: true,
    type: MongooseSchema.Types.Mixed,
  })
  @ApiProperty()
  public data: DATA;
  /**
   * Supplemental information for your submission
   */
  @ValidateNested()
  @IsOptional()
  @Prop({
    default: {},
    type: MongooseSchema.Types.Mixed,
  })
  @ApiProperty()
  public metadata?: METADATA;
  @ValidateNested()
  @IsOptional()
  @Prop({
    index: true,
  })
  @ApiProperty()
  public access?: AccessDTO[];

  // #endregion Object Properties
}
