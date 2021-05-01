import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MATCHES,
  Matches,
  MaxLength,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { NAME_REGEX } from '.';
import { AccessDTO, BaseDTO } from './Base.dto';
import { ACCESS_TYPES, FORM_TYPES } from './constants';
import { FieldMatchAccessPermissionDTO } from './FieldMatchAccessPermission.dto';

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
    type: 'enum',
    enum: FORM_TYPES,
    required: true,
    default: FORM_TYPES.form,
    index: true,
  })
  public type: FORM_TYPES;
  @IsOptional()
  @IsBoolean()
  public deleted?: boolean;
  @IsOptional()
  @ValidateNested({
    each: true,
  })
  @Prop()
  public access: AccessDTO[];
  @IsOptional()
  @ValidateNested({
    each: true,
  })
  @Prop()
  public submissionAccess: AccessDTO[];
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
  @Prop({
    trim: true,
    lowercase: true,
    required: true,
    unique: true,
    index: true,
  })
  @Matches(NAME_REGEX, '', {
    message:
      'Name may only container numbers, letters, and dashes. Must not terminate with a dash',
  })
  public path: string;

  public fieldMatchAccess: Record<
    'type',
    Record<ACCESS_TYPES, FieldMatchAccessPermissionDTO>
  >;

  // #endregion Object Properties
}
