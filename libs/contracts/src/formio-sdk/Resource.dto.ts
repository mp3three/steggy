import {
  IsEnum,
  IsObjectId,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import faker from 'faker';
import { AccessDTO, BaseDTO, BaseOmitProps } from './Base.dto';
import { ResouceSettingsDTO } from './resource/ResourceSettings.dto';

export enum ResourceDisplay {
  Form = 'form',
  Wizard = 'wizard',
  PDF = 'pdf',
}
export enum FormType {
  resource = 'resource',
  form = 'form',
}
export class ComponentDTO {}

/**
 * Base definitions for resources / forms
 */
export class ResourceDTO extends BaseDTO {
  // #region Public Static Methods

  public static fake(): Omit<ResourceDTO, BaseOmitProps> {
    const name = faker.lorem.word();
    return {
      ...super.fake(),
      type: faker.random.arrayElement(Object.values(FormType)),
      display: faker.random.arrayElement(Object.values(ResourceDisplay)),
      controller: '',
      machineName: Array(2)
        .map(() => faker.lorem.word())
        .join(':'),
      name,
      path: name,
      revisions: 'current',
      tags: Array(faker.random.number(5)).map(() => faker.lorem.word()),
      title: faker.lorem.word(),
      properties: {},
      settings: ResouceSettingsDTO.fake(),
      access: Array(faker.random.number(5)).map(() => AccessDTO.fake()),
      components: [],
      submissionAccess: [],
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  /**
   * Display as form / wizard / pdf
   */
  @IsEnum(ResourceDisplay)
  public display: ResourceDisplay;
  /**
   * Resource vs Form
   */
  @IsEnum(FormType)
  public type: FormType;
  /**
   * Stages need project references
   */
  @IsOptional()
  @IsObjectId()
  public project?: string;
  /**
   * Custom controller logic. See README in lib base
   */
  @IsString()
  public controller: string;
  /**
   * > Warning: Tampering with the Form machineName can break Project imports and exports.
   * > This should not be tampered with, unless you know what you're doing.
   *
   * @FIXME: I don't know what I'm doing.. what is this?
   */
  @IsString()
  public machineName: string;
  /**
   * @FIXME: Difference between this and path?
   */
  @IsString()
  public name: string;
  /**
   * @FIXME: difference between this and name?
   */
  @IsString()
  public path: string;
  /**
   * @FIXME: what is this?
   */
  @IsString()
  public revisions: string;
  @IsString({ each: true })
  /**
   *
   */
  public tags: string[];
  /**
   * Human readable title
   */
  @IsString()
  public title: string;
  /**
   * Settings > Custom Properties
   */
  @IsString({
    each: true,
  })
  public properties: Record<string, string>;
  /**
   *
   */
  @ValidateNested()
  public settings: ResouceSettingsDTO;
  /**
   * Association of role ids
   */
  @ValidateNested({
    each: true,
  })
  public access: AccessDTO[];
  /**
   * Form components
   */
  @ValidateNested({
    each: true,
  })
  public components: ComponentDTO[];
  /**
   * Access rules
   */
  @ValidateNested({
    each: true,
  })
  public submissionAccess: AccessDTO[];

  // #endregion Object Properties
}
