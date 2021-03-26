import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { LicenseKeyDTO, LicenseOptionsDTO, UserDTO } from '..';

export enum LicenseScopes {
  'apiServer' = 'apiServer',
  'pdfServer' = 'pdfServer',
  'project' = 'project',
  'tenant' = 'tenant',
  'stage' = 'stage',
  'form' = 'form',
  'formManager' = 'formManager',
  'formRequest' = 'formRequest',
  'email' = 'email',
  'pdf' = 'pdf',
  'pdfDownload' = 'pdfDownload',
  'vpat' = 'vpat',
  'accessibility' = 'accessibility',
  'submissionRequest' = 'submissionRequest',
}

export enum LicenseLocations {
  'onPremise' = 'onPremise',
  'hosted' = 'hosted',
}

export enum LicensePlans {
  Basic = 'basic',
  Independent = 'independent',
  Team_Pro = 'team',
  Enterprise = 'commercial',
  Trial = 'trial',
}
export class LicenseDataDTO {
  // #region Object Properties

  /**
   * Security and Compliance
   */
  @IsBoolean()
  public sac: boolean;
  /**
   * @FIXME: Populate description
   */
  @IsBoolean()
  public vpat: boolean;
  /**
   * License Terms > Plan > Start Date
   */
  @IsDateString()
  public startDate: string;
  /**
   * License Terms > Plan > End Date
   */
  @IsDateString()
  @IsOptional()
  public endDate?: string;
  /**
   * Overview > Location
   */
  @IsEnum(LicenseLocations)
  public location: LicenseLocations;
  @IsEnum(LicensePlans)
  public plan: LicensePlans;
  /**
   * License Terms > On-Premise Servers > API Environment
   */
  @IsNumber()
  public apiServers: number;
  /**
   * License Terms > Usage Limits > Database Tenants
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public dbts: number;
  /**
   * License Terms > Usage Limits > Emails
   *
   * Per Project, Tracked Monthly (hosted only)
   */
  @IsNumber()
  public emails?: number;
  /**
   * License Terms > Usage Limits > Form Manager Projects
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public formManagers: number;
  /**
   * License Terms > Usage Limits > Form Loads
   *
   * Per Project, Tracked as Total (hosted only)
   */
  @IsNumber()
  public formRequests: number;
  /**
   * License Terms > Usage Limits > Forms
   *
   * Per Project, Tracked as Total (hosted only)
   */
  @IsNumber()
  public forms: number;
  /**
   * License Terms > Usage Limits > Additional Live Stages
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public livestages: number;
  /**
   * License Terms > Usage Limits > PDF Generations
   *
   * Per Project, Tracked Monthly (hosted only)
   */
  @IsNumber()
  public pdfDownload: number;
  /**
   * License Terms > On-Premise Servers > PDF Environment
   */
  @IsNumber()
  public pdfServers: number;
  /**
   * License Terms > Usage Limits > Hosted PDF Documents
   *
   * Per Project, Tracked as Total (hosted only)
   */
  @IsNumber()
  public pdfs: number;
  /**
   * License Terms > Usage Limits > Projects
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public projects: number;
  /**
   * License Terms > Usage Limits > Stages (in addition to live)
   *
   * Per License, Tracked as Total
   *
   * > CORS Locked authoring mode stages, these will be unsuitable for production
   */
  @IsNumber()
  public stages: number;
  /**
   * License Terms > Usage Limits > Submission Requests
   *
   * Per Project, Tracked as Total (hosted only)
   */
  @IsNumber()
  public submissionRequests: number;
  /**
   * License Terms > Usage Limits > Form Building Tenants
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public tenants: number;
  /**
   * Overview > Description / Comments
   */
  @IsString()
  public comments: string;
  /**
   * Overview > Company
   */
  @IsString()
  public company: string;
  /**
   * Overview > License Name
   */
  @IsString()
  public licenseName: string;
  /**
   * License Keys
   */
  @ValidateNested({ each: true })
  public licenseKeys: LicenseKeyDTO[];
  /**
   * License Terms > Options
   */
  @ValidateNested()
  public options: LicenseOptionsDTO;
  /**
   * Overview > License Users
   */
  @ValidateNested({
    each: true,
  })
  public user: UserDTO[];

  // #endregion Object Properties
}

export type LicenseUsage = {
  apiServers: number;
  formManagers: number;
  pdfServers: number;
  tenants: number;
  projects: number;
  vpat: number;
};

export type LicenseApiServer = {
  id: string;
  status: '0' | '1';
  environmentId: string;
  hostName: string;
  lastCheck: string;
  mongoHash: string;
};

export type LicenseAdmin = {
  scopes: LicenseScopes[];
  terms: {
    apiServers: number;
    stages: number;
    formManagers: number;
    projects: number;
    tenants: number;
    startDate: string;
    plan: 'commercial';
    options: {
      sac: boolean;
      vpat: boolean;
    };
    emails: number;
    formRequests: number;
    forms: number;
    pdfDownloads: number;
    pdfServers: number;
    pdfs: number;
    submissionRequest?: number;
    vpats: unknown;
  };
  usage: LicenseUsage;
};

export type LicenseItemCommon = {
  id: string;
  status: '0' | '1';
  remote: 'false' | 'true';
  projectType: 'stage' | 'project';
  projectId: string;
  name: string;
  title: string;
};

export type LicenseFormManager = LicenseItemCommon & {
  licenseId: string;
  stageId: string;
  tenantId: string;
  type?: 'formManager';
};

export type LicenseItem = LicenseItemCommon & {
  lastCheck: string;
};

export type LicenseReport = {
  admin: LicenseAdmin;
  apiServer?: LicenseApiServer[];
  projects?: LicenseItem[];
  stages?: LicenseItem[];
  pdfServers?: unknown[];
  tenants?: unknown[];
  formManager?: LicenseItem[];
};
