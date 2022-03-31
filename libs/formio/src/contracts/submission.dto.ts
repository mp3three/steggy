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

import { AccessDTO } from './access.dto';
import { SUBMISSION_STATES } from './constants';
import { DBFake } from './database-fake.dto';
import { TransformObjectId } from './transform-object-id.decorator';

export class ExternalSubmissionIdDTO {
  public id: string;
  public resource?: string;
  public type?: 'resource' | string;

  
}

export class SubmissionDTO<
  DATA extends Record<never, unknown> = Record<never, unknown>,
  METADATA extends Record<never, unknown> = Record<never, unknown>,
> extends DBFake {
  @ValidateNested()
  @IsOptional()
  @ApiProperty()
  public access?: AccessDTO[];

  /**
   * Your data
   */
  @ValidateNested()
  @IsDefined()
  @ApiProperty()
  public data: DATA;
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    readOnly: true,
  })
  public deleted?: number;
  @IsArray()
  @IsOptional()
  @ApiProperty({
    readOnly: true,
  })
  public externalIds?: ExternalSubmissionIdDTO[];
  /**
   * Reference to the resource that created this
   */
  @IsString()
  @ApiProperty()
  @TransformObjectId()
  public form?: string;
  /**
   * Supplemental information for your submission
   */
  @ValidateNested()
  @IsOptional()
  @ApiProperty()
  public metadata?: METADATA;
  /**
   * User ID for owner of this entity
   *
   * See Users collection in Portal Base
   */
  @IsString()
  @IsOptional()
  @ApiProperty()
  @TransformObjectId()
  public owner?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({})
  @TransformObjectId()
  public project?: string;
  /**
   * Ties back to ProjectDTO.access
   */
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty()
  @TransformObjectId()
  public roles?: string[];
  @ApiProperty({
    enum: SUBMISSION_STATES,
  })
  @IsEnum(SUBMISSION_STATES)
  @IsOptional()
  public state?: SUBMISSION_STATES;
  
}
