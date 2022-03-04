import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { AccessDTO } from './access.dto';
import { BaseComponentDTO } from './components';
import { ACCESS_TYPES, FORM_TYPES } from './constants';
import { DBFake } from './database-fake.dto';
import { FieldMatchAccessPermissionDTO } from './field-match-access-permission.dto';
import { TransformObjectId } from './transform-object-id.decorator';

/* eslint-disable security/detect-object-injection */
const NAME_REGEX = '^(?!-)[0-9a-zA-Z-]*(?<!submission|action|-)$';
const NAME_ERROR =
  'May only container numbers, letters, and dashes. Must not terminate with a dash';

export type FlatComponent = {
  component: BaseComponentDTO;
  parent?: BaseComponentDTO;
  path: string;
};
export type FlattenedComponents = Set<FlatComponent>;

export class FormDTO extends DBFake {
  @ValidateNested({
    each: true,
  })
  @IsOptional()
  @ApiProperty({
    description: 'Disallow actions based on team / etc',
    type: AccessDTO,
  })
  public access?: AccessDTO[];
  /**
   * A custom action URL to submit the data to.
   */
  @IsString()
  @IsOptional()
  @ApiProperty({})
  public action?: string;
  @ApiProperty({
    description: 'An array of form components to build forms/data models from',
    type: BaseComponentDTO,
  })
  @IsObject({ each: true })
  @IsOptional()
  public components?: BaseComponentDTO[];
  @ApiProperty({
    description: 'Date of deletion',
    readOnly: true,
  })
  @IsOptional()
  @IsNumber()
  public deleted?: number;
  @IsString()
  @IsOptional()
  @ApiProperty({})
  public display?: string;
  @ValidateNested({ each: true })
  @IsOptional()
  @ApiProperty({})
  public fieldMatchAccess?: Record<
    'type',
    Record<ACCESS_TYPES, FieldMatchAccessPermissionDTO>
  >;
  @IsString()
  @ApiProperty({
    description:
      'Globally unique string for indexing. Auto calculates as projectName[:formName[:submissionId]]',
  })
  public machineName: string;
  /**
   * Used for generating URL paths
   *
   * http://project.your.domain/{form.name}/submit/...
   */
  @IsString()
  @MaxLength(63)
  @Matches(NAME_REGEX, '', {
    message: NAME_ERROR,
  })
  @ApiProperty({
    description: NAME_ERROR,
    format: NAME_REGEX,
    maxLength: 63,
  })
  public name: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    description:
      'User ID for owner of this entity. See Users collection in Portal Base',
    readOnly: true,
  })
  @TransformObjectId()
  public owner?: string;
  @IsString()
  @Matches(NAME_REGEX, '', {
    message: NAME_ERROR,
  })
  @ApiProperty({
    description: NAME_ERROR,
    format: NAME_REGEX,
  })
  public path: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'External project reference',
    readOnly: true,
  })
  @TransformObjectId()
  public project?: string;
  @ApiProperty({
    description: 'Developer definable key:value pairs to attach to the form',
  })
  @IsObject()
  @IsOptional()
  public properties?: Record<string, unknown>;
  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'This vs properties?',
  })
  public settings?: { allowExistsEndpoint?: boolean } | Record<string, unknown>;
  @ValidateNested({
    each: true,
  })
  @IsOptional()
  @ApiProperty({
    type: AccessDTO,
  })
  public submissionAccess?: AccessDTO[];
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({})
  public tags?: string[];
  @IsString()
  @MaxLength(63)
  @ApiProperty({
    description: 'Short human understandable string to describe the form',
    maxLength: 63,
  })
  public title: string;
  @ApiProperty({
    description:
      'These operate the same on the inside, type is for categorization purposes',
    enum: FORM_TYPES,
  })
  @IsEnum(FORM_TYPES)
  public type?: FORM_TYPES;
}
