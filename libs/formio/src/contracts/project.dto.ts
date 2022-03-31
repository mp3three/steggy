import { Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { AccessDTO } from './access.dto';
import {
  PROJECT_FRAMEWORKS,
  PROJECT_PLAN_TYPES,
  PROJECT_TYPES,
} from './constants';
import { DBFake } from './database-fake.dto';
import { EmailConfig } from './email';
import { TransformObjectId } from './transform-object-id.decorator';

export class ProjectSettingsDTO {
  @IsString()
  @IsOptional()
  public cors?: string;
  @ValidateNested()
  @IsOptional()
  public email?: EmailConfig;
  @ValidateNested()
  @IsOptional()
  public keys?: Record<'key' | 'name', string>[];
  @IsString()
  @IsOptional()
  public secret?: string;
}
/**
 * # Description
 * Standard top level project object. Comes in minor variations depending on use case.
 * Acts as an organizational tool for forms and portal resources.
 *
 * ## type: Project
 *
 * Tippy top level, this will also have ProjectDTO.project unset
 *
 * ## type: Stage
 *
 * A child project. Child links to parent via ProjectDTO.project. Not double linked
 */
@Schema({
  collection: 'projects',
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class ProjectDTO<
  Settings extends Record<never, unknown> = ProjectSettingsDTO,
> extends DBFake {
  /**
   * Association of role ids
   */
  @IsOptional()
  @ValidateNested({
    each: true,
  })
  @ApiProperty({
    type: AccessDTO,
  })
  public access?: AccessDTO[];
  /**
   * Unkown purpose
   */
  @IsOptional()
  @ApiProperty({})
  public billing?: Record<string, unknown>;
  /**
   * Extra configuration options
   *
   * @FIXME: What are all the options here?
   */
  @IsOptional()
  @ApiProperty({})
  public config?: {
    defaultStageName?: string;
  };
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Deletion timestamp',
    readOnly: true,
  })
  public deleted?: number;
  /**
   * Description of project
   */
  @IsString()
  @MaxLength(512)
  @IsOptional()
  @ApiProperty({
    maxLength: 512,
    type: 'string',
  })
  public description?: string;
  /**
   * @FIXME: What is this?
   */
  @IsOptional()
  public formDefaults?: Record<string, unknown>;
  /**
   * Selected framework for this project
   */
  @IsEnum(PROJECT_FRAMEWORKS)
  @IsOptional()
  @ApiProperty({
    enum: PROJECT_FRAMEWORKS,
  })
  public framework?: string;
  @IsDateString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
  })
  public lastDeploy?: string;
  @IsString()
  @ApiProperty({
    description:
      'Globally unique string for indexing. Auto calculates as projectName[:formName[:submissionId]]',
  })
  public machineName: string;
  /**
   * Used for generating URL paths
   *
   * @example "Live Endpoint" http://your.portal/{name}
   */
  @IsString()
  @MaxLength(63)
  @Matches('^[0-9a-zA-Z][0-9a-zA-Z-]*[0-9a-zA-Z]?$', '', {
    message:
      'Name may only container numbers, letters, and dashes. Must not terminate with a dash',
  })
  @ApiProperty({
    maxLength: 63,
    type: 'string',
  })
  public name: string;
  /**
   * User ID for owner of this entity
   *
   * See Users collection in Portal Base
   */
  @IsString()
  @IsOptional()
  @ApiProperty({
    description:
      'User ID for owner of this entity. See Users collection in Portal Base',
    readOnly: true,
  })
  public owner?: string;
  /**
   * @FIXME: What are the implications of this?
   */
  @IsEnum(PROJECT_PLAN_TYPES)
  @IsOptional()
  @ApiProperty({
    enum: PROJECT_PLAN_TYPES,
  })
  public plan?: PROJECT_PLAN_TYPES;
  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    type: 'boolean',
  })
  public primary?: boolean;
  /**
   * If defined, then this must be a stage. ID reference to another project
   */
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'External project reference',
    readOnly: true,
  })
  @TransformObjectId()
  public project?: string;
  /**
   * Disallow modifications while set
   */
  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    type: 'boolean',
  })
  public protect?: boolean;
  @IsOptional()
  @ValidateNested()
  @ApiProperty()
  public settings?: Settings;
  @IsOptional()
  /**
   * Internal variable. Only used inside database adapters
   */
  public settings_encrypted?: Buffer;
  /**
   * @FIXME: What is this? Short text that goes in the top tab?
   */
  @IsString()
  @MaxLength(63)
  @IsOptional()
  public stageTitle?: string;
  /**
   * @FIXME: What is this?
   */
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    items: {
      type: 'string',
    },
  })
  public steps?: string[];
  @IsString()
  @MaxLength(32)
  @IsOptional()
  @ApiProperty({
    maxLength: 32,
    type: 'string',
  })
  public tag?: string;
  /**
   * Human understandable title
   */
  @IsString()
  @MaxLength(63)
  @ApiProperty({
    maxLength: 63,
    type: 'string',
  })
  public title: string;
  /**
   * If your account is a trial, this is when it will expire
   */
  @IsDateString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
  })
  public trial?: string;
  /**
   * - Project: My Precious Project
   *   - Stage: **Live\***
   *   - Stage: Dev
   *   - Stage: Test
   *   - Stage: For Fun
   *
   * ## Note
   *
   * **Live\*** This "stage" is actually the project itself.
   *
   * The portal UI presents it as it's own distinct stage visually.
   */
  @IsEnum(PROJECT_TYPES)
  @ApiProperty({
    enum: PROJECT_TYPES,
  })
  public type?: PROJECT_TYPES;

  
}
