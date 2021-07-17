import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { LicenseTrackables } from './trackables';

export class LicenseDataEnvironmentDTO {
  // #region Object Properties

  @IsNumber()
  public quantity: number;
  @IsString()
  public expires: string;
  @IsString()
  public licenseKey: string;
  @IsString()
  public recommendedVersion: string;
  @IsString()
  public type: string;

  // #endregion Object Properties
}

export class LicenseDataFreezeDTO {
  // #region Object Properties

  @IsBoolean()
  public enabled: boolean;

  // #endregion Object Properties
}

export class LicenseDataUtilizationInstancesDTO {
  // #region Object Properties

  @IsDate()
  public created: Date;
  @IsDate()
  public lastObserved: Date;
  @IsNumber()
  public pid: number;
  @IsString()
  public hostName: string;
  @IsString()
  public version: string;

  // #endregion Object Properties
}

export class LicenseDataUtilizationTrackedItemDTO {
  // #region Object Properties

  @IsBoolean()
  public created: boolean;
  @IsBoolean()
  public enabled: boolean;
  @IsString()
  public _id: string;
  @IsString()
  public name: string;
  @IsString()
  public owner: string;
  @IsString()
  public title: string;
  @IsString()
  public type: string;

  // #endregion Object Properties
}

export class LicenseDataUtilizationDTO {
  // #region Object Properties

  @IsBoolean()
  public enabled: boolean;
  @IsString()
  public environmentId: string;
  @IsString()
  public licenseKey: string;
  @IsString()
  public title: string;
  @IsString()
  public type: string;
  @ValidateNested({ each: true })
  public instances: LicenseDataUtilizationInstancesDTO[];
  @ValidateNested({ each: true })
  public trackedItems: LicenseDataUtilizationTrackedItemDTO[];

  // #endregion Object Properties
}

export class LicenseDataDTO {
  // #region Object Properties

  @IsBoolean()
  public hasCustomDevelopment: boolean;
  @IsBoolean()
  public trackInstances: boolean;
  @IsEmail()
  public licenseOwner: string;
  @IsEmail()
  public techLead: string;
  @IsString()
  public comments: string;
  @IsString()
  public licenseName: string;
  @ValidateNested({ each: true })
  public environments: LicenseDataEnvironmentDTO[];
  @ValidateNested()
  public flags: Record<'all' | 'encryption' | 'auditLogging' | 'vpat', boolean>;
  @ValidateNested()
  public freeze: LicenseDataFreezeDTO;
  @ValidateNested()
  public itemTrackers: Record<LicenseTrackables, number>;
  @ValidateNested()
  public utilizations: LicenseDataUtilizationDTO[];

  // #endregion Object Properties
}
