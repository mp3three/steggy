import { DBFake } from '@automagical/contracts';
import { MONGO_COLLECTIONS } from '@automagical/contracts/constants';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import faker from 'faker';
import { Schema as MongooseSchema } from 'mongoose';

import { AccessDTO, BaseOmitProperties, NAME_REGEX } from '.';
import { ACCESS_TYPES, FORM_TYPES } from './constants';
import { FieldMatchAccessPermissionDTO } from './field-match-access-permission.dto';

@Schema({
  collection: MONGO_COLLECTIONS.forms,
  minimize: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class FormDTO extends DBFake {
  // #region Public Static Methods

  public static fake(
    mixin: Partial<FormDTO> = {},
    withID = false,
  ): Omit<FormDTO, BaseOmitProperties> {
    return {
      ...(withID ? super.fake() : {}),
      machineName: faker.lorem.slug(3).split('-').join(':'),
      name: faker.lorem.slug(8),
      path: faker.lorem.slug(4),
      title: faker.lorem.word(8),
      type: faker.random.arrayElement(Object.values(FORM_TYPES)),
      ...mixin,
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsEnum(FORM_TYPES)
  @Prop({
    default: FORM_TYPES.form,
    enum: FORM_TYPES,
    index: true,
    required: true,
    type: MongooseSchema.Types.String,
  })
  public type: FORM_TYPES;
  @IsObject({ each: true })
  @IsOptional()
  @Prop()
  public components?: Record<string, unknown>[];
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
  @IsOptional()
  @IsNumber()
  @Prop({ default: null })
  public deleted?: number;
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
   * If defined, then this must be a stage. ID reference to another project
   */
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
  @IsString()
  @Matches(NAME_REGEX, '', {
    message:
      'Name may only container numbers, letters, and dashes. Must not terminate with a dash',
  })
  @Prop({
    index: true,
    lowercase: true,
    required: true,
    trim: true,
    unique: true,
  })
  public path: string;
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
  @ValidateNested({
    each: true,
  })
  @IsOptional()
  @Prop()
  public access?: AccessDTO[];
  @ValidateNested({
    each: true,
  })
  @IsOptional()
  @Prop()
  public submissionAccess?: AccessDTO[];
  @ValidateNested({ each: true })
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public fieldMatchAccess?: Record<
    'type',
    Record<ACCESS_TYPES, FieldMatchAccessPermissionDTO>
  >;

  // #endregion Object Properties
}
