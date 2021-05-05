import { MONGO_COLLECTIONS } from '@automagical/contracts/constants';
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
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import faker from 'faker';
import { Schema as MongooseSchema } from 'mongoose';

import { DBFake } from '../../classes';
import { BaseOmitProperties } from '.';
import { AccessDTO } from './Access.dto';
import {
  PROJECT_FRAMEWORKS,
  PROJECT_PLAN_TYPES,
  PROJECT_TYPES,
} from './constants';

export class ProjectSettingsDTO {
  // #region Object Properties

  @IsString()
  @IsOptional()
  public cors?: string;

  // #endregion Object Properties
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
  collection: MONGO_COLLECTIONS.projects,
  minimize: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class ProjectDTO<
  Settings extends Record<never, unknown> = ProjectSettingsDTO
> extends DBFake {
  // #region Public Static Methods

  public static fake(
    mixin: Partial<ProjectDTO> = {},
    withID = false,
  ): Omit<ProjectDTO, BaseOmitProperties> {
    return {
      ...(withID ? super.fake() : {}),
      name: faker.lorem.slug(5),
      plan: faker.random.arrayElement(Object.values(PROJECT_PLAN_TYPES)),
      stageTitle: faker.lorem.word(),
      tag: faker.system.semver(),
      title: faker.lorem.word(8),
      type: faker.random.arrayElement(Object.values(PROJECT_TYPES)),
      ...mixin,
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsBoolean()
  @IsOptional()
  @Prop()
  public primary?: boolean;
  /**
   * Disallow modifications while set
   */
  @IsBoolean()
  @IsOptional()
  @Prop()
  public protect?: boolean;
  @IsDateString()
  @IsOptional()
  @Prop()
  public lastDeploy?: string;
  /**
   * If your account is a trial, this is when it will expire
   */
  @IsDateString()
  @IsOptional()
  @Prop()
  public trial?: string;
  /**
   * Selected framework for this project
   */
  @IsEnum(PROJECT_FRAMEWORKS)
  @IsOptional()
  @Prop({
    default: PROJECT_FRAMEWORKS.angular,
    enum: PROJECT_FRAMEWORKS,
  })
  public framework?: string;
  /**
   * @FIXME: What are the implications of this?
   */
  @IsEnum(PROJECT_PLAN_TYPES)
  @IsOptional()
  @Prop({
    default: PROJECT_PLAN_TYPES.trial,
    enum: PROJECT_PLAN_TYPES,
    type: MongooseSchema.Types.String,
  })
  public plan?: PROJECT_PLAN_TYPES;
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
  @Prop({
    default: PROJECT_TYPES.project,
    enum: PROJECT_TYPES,
    index: true,
    type: MongooseSchema.Types.String,
  })
  public type?: PROJECT_TYPES;
  @IsNumber()
  @IsOptional()
  @Prop({ default: null })
  public deleted?: number;
  /**
   * Unkown purpose
   */
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public billing?: Record<string, unknown>;
  /**
   * Extra configuration options
   *
   * @FIXME: What are all the options here?
   */
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public config?: {
    defaultStageName?: string;
  };
  /**
   * @FIXME: What is this?
   */
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public formDefaults?: Record<string, unknown>;
  /**
   * Association of role ids
   */
  @IsOptional()
  @ValidateNested({
    each: true,
  })
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public access?: AccessDTO[];
  @IsOptional()
  @ValidateNested()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public settings?: Settings;
  /**
   * User ID for owner of this entity
   *
   * See Users collection in Portal Base
   */
  @IsString()
  @IsOptional()
  // @Prop({ index: true, ref: 'submission', required: true })
  public owner?: string;
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
   * @FIXME: What is this?
   */
  @IsString({ each: true })
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public steps?: string[];
  /**
   * Description of project
   */
  @IsString()
  @MaxLength(512)
  @IsOptional()
  @Prop({ maxlength: 512 })
  public description?: string;
  /**
   * @FIXME: What is this? Short text that goes in the top tab?
   */
  @IsString()
  @MaxLength(63)
  @IsOptional()
  @Prop()
  public stageTitle?: string;
  /**
   * Last deployed tag of the project.
   */
  @IsString()
  @MaxLength(32)
  @IsOptional()
  @Prop({ default: '0.0.0', maxlength: 32 })
  public tag?: string;
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
  @Prop({ index: true, maxlength: 63, required: true })
  public name: string;
  /**
   * Human understandable title
   */
  @IsString()
  @MaxLength(63)
  @Prop({ index: true, maxlength: 63, required: true })
  public title: string;
  @ValidateNested()
  @IsOptional()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public remote?: Record<'name' | 'title' | '_id', string>;

  // #endregion Object Properties
}
