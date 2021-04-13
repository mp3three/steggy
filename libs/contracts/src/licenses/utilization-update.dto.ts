import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from '@automagical/validation';
import { PROJECT_TYPES } from '../formio-sdk';
import { LicenseScopes } from './types';

export class UtilizationUpdateDTO {
  // #region Object Properties

  @IsBoolean()
  public remote: boolean;
  /**
   * TODO I'm pretty sure this definition isn't right, because then it'd be redundant
   */
  @IsEnum(PROJECT_TYPES)
  public projectType: PROJECT_TYPES;
  /**
   * project/stage
   */
  @IsEnum(LicenseScopes)
  public type: LicenseScopes;
  @IsString()
  public hostname: string;
  /**
   * License key associated with API server
   */
  @IsString()
  public licenseKey: LicenseScopes;
  /**
   * project/stage name
   */
  @IsString()
  public name: string;
  @IsString()
  public projectId: string;
  /**
   * project/stage title
   */
  @IsString()
  public title: string;
  @IsString()
  @IsOptional()
  public environmentId?: string;
  @IsString()
  @IsOptional()
  public formId?: string;
  @IsString()
  @IsOptional()
  public hostName?: string;
  @IsString()
  @IsOptional()
  public mongoHash?: string;
  @IsString()
  @IsOptional()
  public stageId?: string;
  @IsString()
  @IsOptional()
  public tenantId?: string;

  // #endregion Object Properties
}
