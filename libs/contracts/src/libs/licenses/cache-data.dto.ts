import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';

export class CacheFormDTO {
  // #region Object Properties

  @IsBoolean()
  @IsOptional()
  public disabled?: boolean;
  @IsString()
  public formId: string;

  // #endregion Object Properties
}

export class CacheEnvironmentDTO {
  // #region Object Properties

  @IsBoolean()
  @IsOptional()
  public disabled?: boolean;
  @IsString()
  public environmentId: string;
  @IsString()
  public hostname: string;
  @IsString()
  public mongoHash: string;

  // #endregion Object Properties
}

export class CacheProjectDTO {
  // #region Object Properties

  @IsOptional()
  @IsBoolean()
  public disabled?: boolean;
  @IsOptional()
  @IsBoolean()
  public formRequests?: number;
  @IsOptional()
  @IsNumber()
  public email?: number;
  @IsOptional()
  @IsNumber()
  public pdf?: number;
  @IsOptional()
  @IsNumber()
  public pdfDownload?: number;
  @IsOptional()
  @IsNumber()
  public submissionRequest?: number;
  @IsOptional()
  @IsString()
  public stageId?: string;
  @IsOptional()
  @ValidateNested()
  public forms?: CacheFormDTO[];
  @IsOptional()
  @ValidateNested()
  public livestages?: CacheProjectDTO[];
  @IsString()
  public projectId: string;

  // #endregion Object Properties
}

export class FormManagerDTO {}

export class CacheData {
  // #region Object Properties

  @IsNumber()
  public dbts?: number;
  @IsNumber()
  public pdfServers?: number;
  @IsNumber()
  public vpats?: number;
  @IsString()
  public apiKey: string;
  @ValidateNested()
  public environments: CacheEnvironmentDTO[];
  @ValidateNested()
  public formManagers: FormManagerDTO[];
  @ValidateNested()
  public projects: CacheProjectDTO[];

  // #endregion Object Properties
}
