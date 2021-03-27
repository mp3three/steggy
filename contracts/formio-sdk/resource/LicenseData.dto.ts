import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { LicenseKeyDTO, UserDTO } from '..';
import { LicenseUsageDTO } from './license/Usage.dto';
import { LicenseAdminDTO, LicenseTermsDTO } from './LicenseAdmin.dto';

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
export class LicenseDataDTO extends LicenseTermsDTO {
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
   * Overview > Location
   */
  @IsEnum(LicenseLocations)
  public location: LicenseLocations;
  /**
   * License Terms > Usage Limits > Database Tenants
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public dbts: number;
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
   * Overview > License Users
   */
  @ValidateNested({
    each: true,
  })
  public user: UserDTO[];

  // #endregion Object Properties
}

export type LicenseApiServer = {
  id: string;
  status: '0' | '1';
  environmentId: string;
  hostName: string;
  lastCheck: string;
  mongoHash: string;
};

// export type LicenseItemCommon = {
//   id: string;
//   status: '0' | '1';
//   remote: 'false' | 'true';
//   projectType: 'stage' | 'project';
//   projectId: string;
//   name: string;
//   title: string;
// };

// export type LicenseFormManager = LicenseItemCommon & {
//   licenseId: string;
//   stageId: string;
//   tenantId: string;
//   type?: 'formManager';
// };

// export type LicenseItem = LicenseItemCommon & {
//   lastCheck: string;
// };

// export type LicenseReport = {
//   admin: LicenseAdminDTO;
//   apiServer?: LicenseApiServer[];
//   projects?: LicenseItem[];
//   stages?: LicenseItem[];
//   pdfServers?: unknown[];
//   tenants?: unknown[];
//   formManager?: LicenseItem[];
// };
