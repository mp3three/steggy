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
   * @FIXME: Is this just internal use?
   */
  @IsOptional()
  @IsEnum(SUBMISSION_STATES)
  @Prop({
    type: 'enum',
    enum: SUBMISSION_STATES,
  })
  public state?: SUBMISSION_STATES;
  /**
   * Ties back to ProjectDTO.access
   */
  @IsOptional()
  @IsString({ each: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'role',
    index: true,
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
  @Prop({ ref: 'form', required: true, index: true })
  public form: string;
  /**
   * Supplemental information for your submission
   */
  @ValidateNested()
  @Prop({
    type: mongoose.Schema.Types.Mixed,
    default: {},
  })
  public metadata?: METADATA;
  /**
   * Your data
   */
  @ValidateNested()
  @Prop({
    type: mongoose.Schema.Types.Mixed,
    required: true,
  })
  public data: DATA;

  // #endregion Object Properties
}