import {
  IsArray,
  IsEnum,
  IsObjectId,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { SubmissionStates } from '../data';
import { BaseDTO } from './Base.dto';

export class SubmissionDTO<
  DATA extends Record<never, unknown> = Record<never, unknown>,
  METADATA extends Record<never, unknown> = Record<never, unknown>
> extends BaseDTO {
  // #region Object Properties

  /**
   * Reference to the resource that created this
   */
  @IsObjectId()
  public form: string;
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
  @IsEnum(SubmissionStates)
  public state?: SubmissionStates;
  /**
   * Ties back to ProjectDTO.access
   */
  @IsOptional()
  @IsString({ each: true })
  public roles?: string[];
  /**
   * Your data
   */
  @ValidateNested()
  public data: DATA;
  /**
   * Supplemental information for your submission
   */
  @ValidateNested()
  public metadata?: METADATA;

  // #endregion Object Properties
}
