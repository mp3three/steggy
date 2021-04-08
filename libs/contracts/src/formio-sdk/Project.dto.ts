import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
  MaxLength,
  Matches,
} from '@automagical/validation';
import * as faker from 'faker';
import { AccessDTO, BaseDTO, BaseOmitProps } from './Base.dto';

export enum PROJECT_PLAN_TYPES {
  basic = 'basic',
  independent = 'independent',
  team = 'team',
  trial = 'trial',
  commercial = 'commercial',
}

export enum PROJECT_TYPES {
  project = 'project',
  stage = 'stage',
  tenant = 'tenant',
}

/**
 * As listed in formio-server at least 🤷‍♂️
 */
export enum PROJECT_FRAMEWORKS {
  javascript = 'javascript',
  angular2 = 'angular2',
  aurelia = 'aurelia',
  angular = 'angular',
  simple = 'simple',
  custom = 'custom',
  html5 = 'html5',
  react = 'react',
  vue = 'vue',
}

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
export class ProjectDTO extends BaseDTO {
  // #region Public Static Methods

  public static fake(): Omit<ProjectDTO, BaseOmitProps> {
    return {
      ...super.fake(),
      stageTitle: faker.lorem.word(),
      tag: faker.system.semver(),
      title: faker.lorem.word(8),
      name: faker.lorem.slug(1),
      type: faker.random.arrayElement(Object.values(PROJECT_TYPES)),
      plan: faker.random.arrayElement(Object.values(PROJECT_PLAN_TYPES)),
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
  public type: PROJECT_TYPES;
  /**
   * Unkown purpose currently
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
  @IsOptional()
  @IsBoolean()
  public deleted?: boolean;
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
   *
   * @FIXME: Generate full list
   * @FIXME: Is this just cosmetic?
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
  public settings?: ProjectSettingsDTO;
  /**
   * Association of role ids
   */
  @IsOptional()
  @ValidateNested({
    each: true,
  })
  public access?: AccessDTO[];
  /**
   * @FIXME: What is this? Short text that goes in the top tab?
   */
  @IsString()
  @IsOptional()
  @MaxLength(63)
  public stageTitle?: string;
  /**
   * @FIXME: What are the implications of this?
   */
  @IsString()
  @IsOptional()
  @IsEnum(PROJECT_PLAN_TYPES)
  public plan?: PROJECT_PLAN_TYPES;
  /**
   * Last deployed tag of the project.
   */
  @IsString()
  @IsOptional()
  @MaxLength(32)
  public tag?: string;
  /**
   * Human understandable title
   */
  @IsString()
  @MaxLength(63)
  public title: string;
  @IsString()
  @MaxLength(512)
  @IsOptional()
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
  public name: string;
  @ValidateNested()
  @IsOptional()
  public remote?: Record<'name' | 'title' | '_id', string>;

  // #endregion Object Properties
}
