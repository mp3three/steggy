import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { NAME_REGEX } from '.';
import { AccessDTO, BaseDTO } from '.';
import { ACCESS_TYPES, FORM_TYPES } from './constants';
import { FieldMatchAccessPermissionDTO } from './field-match-access-permission.dto';

@Schema({
  minimize: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class FormDTO extends BaseDTO {
  // #region Object Properties

  @IsEnum(FORM_TYPES)
  @Prop({
    default: FORM_TYPES.form,
    enum: FORM_TYPES,
    index: true,
    required: true,
    type: 'enum',
  })
  public type: FORM_TYPES;
  @IsObject()
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public properties?: Record<string, unknown>;
  @IsObject()
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public settings?: Record<string, unknown>;
  @IsObject({ each: true })
  @Prop()
  @IsOptional()
  public components?: Record<string, unknown>[];
  @IsOptional()
  @ValidateNested({
    each: true,
  })
  @Prop()
  public access?: AccessDTO[];
  @IsOptional()
  @ValidateNested({
    each: true,
  })
  @Prop()
  public submissionAccess?: AccessDTO[];
  /**
   * A custom action URL to submit the data to.
   */
  @IsString()
  @IsOptional()
  @Prop()
  public action?: string;
  @IsString()
  @IsOptional()
  @Prop()
  public display?: string;
  @IsString({ each: true })
  @IsOptional()
  @Prop({ index: true })
  public tags?: string[];
  /**
   * Used for generating URL paths
   *
   * http://project.your.domain/{form.name}/submit/...
   */
  @IsString()
  @MaxLength(63)
  @Matches(NAME_REGEX, '', {
    message:
      'Name may only container numbers, letters, and dashes. Must not terminate with a dash',
  })
  @Prop({
    required: true,
    unique: true,
  })
  public name: string;
  @IsString()
  @MaxLength(63)
  @Prop({
    required: true,
  })
  public title: string;
  @IsString()
  @Prop({})
  public machineName: string;
  @IsString()
  @Prop({
    index: true,
    lowercase: true,
    required: true,
    trim: true,
    unique: true,
  })
  @Matches(NAME_REGEX, '', {
    message:
      'Name may only container numbers, letters, and dashes. Must not terminate with a dash',
  })
  public path: string;
  @ValidateNested({ each: true })
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public fieldMatchAccess: Record<
    'type',
    Record<ACCESS_TYPES, FieldMatchAccessPermissionDTO>
  >;

  // #endregion Object Properties
}
