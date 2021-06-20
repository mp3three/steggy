import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { UserDTO } from '../formio-sdk';
import { LicenseKeyDTO } from './key.dto';
import { LicenseOptionsDTO } from './options.dto';

export enum LicensePlans {
  independent = 'independent',
  commercial = 'commercial',
  basic = 'basic',
  trial = 'trial',
  team = 'team',
}

export class LicenseDataDTO {
  // #region Object Properties

  @IsDateString()
  @IsOptional()
  public developmentLicense?: boolean;
  @IsDateString()
  @IsOptional()
  public startDate?: string;
  @IsEnum(LicensePlans)
  public plan: LicensePlans;
  @IsNumber()
  public apiServers: number;
  @IsNumber()
  public emails: number;
  @IsNumber()
  public formManagers: number;
  @IsNumber()
  public formRequests: number;
  @IsNumber()
  public forms: number;
  @IsNumber()
  public pdfDownloads: number;
  @IsNumber()
  public pdfServers: number;
  @IsNumber()
  public pdfs: number;
  @IsNumber()
  public projects: number;
  @IsNumber()
  public stages: number;
  @IsNumber()
  public submissionRequests: number;
  @IsNumber()
  public tenants: number;
  @IsNumber()
  public vpats: number;
  @IsOptional()
  @IsDateString()
  public endDate?: string;
  @IsOptional()
  @ValidateNested()
  public user?: UserDTO[];
  @ValidateNested()
  public options: LicenseOptionsDTO;
  @ValidateNested()
  @IsOptional()
  public licenseKeys: LicenseKeyDTO[];

  // #endregion Object Properties
}
