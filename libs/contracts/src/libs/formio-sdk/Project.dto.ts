import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from '@automagical/validation';
import { Prop } from '@nestjs/mongoose';
import faker from 'faker';
import { BaseDTO, BaseOmitProperties } from '.';
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
 * # Example object
 *
 * ```json
 * {
 *   "_id": "602fd8a8c4eb75cabbcfa01f",
 *   "type": "stage",
 *   "tag": "0.0.0",
 *   "owner": "602fd7dcc4eb753dc6cf9ff3",
 *   "plan": "commercial",
 *   "steps": [],
 *   "framework": "angular",
 *   "protect": false,
 *   "formDefaults": null,
 *   "title": "Dev",
 *   "stageTitle": "Dev",
 *   "project": "602fd8a7c4eb757f4dcfa001",
 *   "name": "dev-wlpudpkxpjrppad",
 *   "config": {
 *     "defaultStageName": "dev"
 *   },
 *   "access": [
 *     {
 *       "roles": [
 *         "602fd8a8c4eb750328cfa020"
 *       ],
 *       "type": "create_all"
 *     }
 *   ],
 *   "trial": "2021-02-19T15:26:32.273Z",
 *   "created": "2021-02-19T15:26:32.273Z",
 *   "modified": "2021-02-19T15:26:32.275Z"
 * }
 * ```
 */
export class ProjectDTO<
  Settings extends Record<never, unknown> = ProjectSettingsDTO
> extends BaseDTO {
  // #region Public Static Methods

  public static fake(): Omit<ProjectDTO, BaseOmitProperties> {
    return {
      ...super.fake(),
      name: faker.lorem.slug(1),
      plan: faker.random.arrayElement(Object.values(PROJECT_PLAN_TYPES)),
      stageTitle: faker.lorem.word(),
      tag: faker.system.semver(),
      title: faker.lorem.word(8),
      type: faker.random.arrayElement(Object.values(PROJECT_TYPES)),
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsBoolean()
  @IsOptional()
  public primary?: boolean;
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
    type: 'enum',
  })
  public type!: PROJECT_TYPES;
  /**
   * Unkown purpose
   */
  @IsOptional()
  public billing?: Record<string, unknown>;
  /**
   * Extra configuration options
   *
   * @FIXME: What are all the options here?
   */
  @IsOptional()
  public config?: {
    defaultStageName?: string;
  };
  /**
   * @FIXME: What is this?
   */
  @IsOptional()
  public formDefaults?: Record<string, unknown>;
  /**
   * Disallow modifications while set
   */
  @IsOptional()
  @IsBoolean()
  public protect?: boolean;
  @IsOptional()
  @IsDateString()
  public lastDeploy?: string;
  /**
   * If your account is a trial, this is when it will expire
   */
  @IsOptional()
  @IsDateString()
  public trial?: string;
  /**
   * Selected framework for this project
   */
  @IsOptional()
  @IsEnum(PROJECT_FRAMEWORKS)
  public framework?: string;
  /**
   * @FIXME: What is this?
   */
  @IsOptional()
  @IsString({ each: true })
  public steps?: string[];
  @IsOptional()
  @ValidateNested()
  public settings?: Settings;
  /**
   * Association of role ids
   */
  @IsOptional()
  @ValidateNested({
    each: true,
  })
  public access?: AccessDTO[];
  /**
   * @FIXME: What are the implications of this?
   */
  @IsString()
  @IsOptional()
  @IsEnum(PROJECT_PLAN_TYPES)
  public plan?: PROJECT_PLAN_TYPES;
  /**
   * @FIXME: What is this? Short text that goes in the top tab?
   */
  @IsString()
  @IsOptional()
  @MaxLength(63)
  public stageTitle?: string;
  /**
   * Last deployed tag of the project.
   */
  @IsString()
  @IsOptional()
  @MaxLength(32)
  @Prop({ default: '0.0.0', maxlength: 32 })
  public tag?: string;
  @IsString()
  @MaxLength(512)
  @IsOptional()
  @Prop({ maxlength: 512 })
  /**
   * Description of project
   */
  public description?: string;
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
  public remote?: Record<'name' | 'title' | '_id', string>;

  // #endregion Object Properties
}
