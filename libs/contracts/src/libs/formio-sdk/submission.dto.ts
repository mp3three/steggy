import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { BaseDTO, timestamps } from '.';
import { AccessDTO } from './Access.dto';
import { SUBMISSION_STATES } from './constants';

@Schema({
  minimize: false,
  timestamps,
})
export class SubmissionDTO<
  DATA extends Record<never, unknown> = Record<never, unknown>,
  METADATA extends Record<never, unknown> = Record<never, unknown>
> extends BaseDTO {
  // #region Object Properties

  /**
   * @FIXME: What is this?
   */
  @IsOptional()
  @IsArray()
  public externalIds?: unknown[];
  /**
   * @FIXME: Is this for internal use?
   */
  @IsOptional()
  @IsEnum(SUBMISSION_STATES)
  @Prop({
    enum: SUBMISSION_STATES,
    type: 'enum',
  })
  public state?: SUBMISSION_STATES;
  /**
   * Ties back to ProjectDTO.access
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop({
    index: true,
    ref: 'role',
    type: mongoose.Schema.Types.ObjectId,
  })
  public roles?: string[];
  @IsOptional()
  @ValidateNested()
  @Prop({
    index: true,
  })
  public access?: AccessDTO[];
  /**
   * Reference to the resource that created this
   */
  @IsString()
  @Prop({ index: true, ref: 'form', required: true })
  public form: string;
  /**
   * Supplemental information for your submission
   */
  @ValidateNested()
  @Prop({
    default: {},
    type: mongoose.Schema.Types.Mixed,
  })
  public metadata?: METADATA;
  /**
   * Your data
   */
  @ValidateNested()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.Mixed,
  })
  public data: DATA;

  // #endregion Object Properties
}
