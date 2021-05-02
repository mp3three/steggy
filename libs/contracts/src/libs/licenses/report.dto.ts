import { IsDateString, IsEnum, IsString } from '@automagical/validation';
import { LicenseAdminDTO } from '@automagical/contracts/formio-sdk';
import { LicenseApiServer } from './api-server.dto';

enum ProjectType {
  stage = 'stage',
  project = 'project',
  livestage = 'livestage',
}

export class LicenseItemCommonDTO {
  // #region Object Properties

  @IsEnum(ProjectType)
  public projectType: ProjectType;
  @IsString()
  public id: string;
  @IsString()
  public name: string;
  @IsString()
  public projectId: string;
  @IsString()
  public title: string;

  public remote: 'false' | 'true';
  public status: '0' | '1';

  // #endregion Object Properties
}

// export type LicenseFormManager = LicenseItemCommon & {
//   licenseId: string;
//   stageId: string;
//   tenantId: string;
//   type?: 'formManager';
// };

export class LicenseItemDTO extends LicenseItemCommonDTO {
  // #region Object Properties

  @IsDateString()
  public lastCheck: string;

  // #endregion Object Properties
}

export class LicenseReportDTO {
  // #region Object Properties

  public admin: LicenseAdminDTO;
  apiServer?: LicenseApiServer[];
  formManager?: LicenseItemDTO[];
  pdfServers?: unknown[];
  projects?: LicenseItemDTO[];
  stages?: LicenseItemDTO[];
  tenants?: unknown[];

  // #endregion Object Properties
}
