import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from '@automagical/validation';
import { LicenseOptionsDTO } from './Options.dto';
import { LicensePlans } from './types';

// Not sure if this is useful right now, but I don't feel like re-writing later
// import { createHash } from 'crypto';
// public static VerifyHash(
//   response: UtilizationResponseDTO,
//   body: Record<string, unknown>,
// ) {
//   const base64 = Buffer.from(JSON.stringify(body)).toString('base64');
//   const md5 = createHash('md5').update(base64).digest('hex');
//   return md5 === response.hash;
// }

export class UtilizationResponseTermsDTO {
  // #region Object Properties

  @IsDateString()
  @IsOptional()
  public startDate?: string;
  @IsNumber()
  public apiServers: number;
  @IsNumber()
  public emails: number;
  @IsNumber()
  public endregion: number;
  @IsNumber()
  public formManagers: number;
  @IsNumber()
  public formRequests: number;
  @IsNumber()
  public forms: number;
  @IsNumber()
  public livestages: number;
  @IsNumber()
  public pdfDownloads: number;
  @IsNumber()
  public pdfServers: number;
  @IsNumber()
  public pdfs: number;
  @IsNumber()
  public projects: number;
  @IsNumber()
  public submissionRequests: number;
  @IsNumber()
  public tenants: number;
  @IsNumber()
  public vpats: number;
  @IsOptional()
  @IsDateString()
  public endDate?: string;

  public options: LicenseOptionsDTO;
  public plan: LicensePlans;

  // #endregion Object Properties
  //     "plan": "commercial",
  //     "startDate": "2021-03-07T06:00:00.000Z",
  //     "endDate": null,
  //     "options": {
  //       "sac": true,
  //       "vpat": true,
  //       "evaluation": false
  //     }
}

export class UtilizationResponseDTO {
  // #region Object Properties

  public terms: UtilizationResponseTermsDTO;

  // #endregion Object Properties
}

// {
//   "type": "project",
//   "projectId": "605ca3960672db26753e6108",
//   "licenseId": "604528207c9ad312c9fc80b3",
//   "licenseKey": "mj2ZRYgZCeZpVv5yyegpBOGkjpXB7",
//   "used": {
//     "emails": 0,
//     "forms": 0,
//     "formRequests": 0,
//     "pdfs": 0,
//     "pdfDownloads": 0,
//     "submissionRequests": 0
//   },
//   "devLicense": false,
//   "terms": {
//     "projects": 1000000,
//     "tenants": 1000000,
//     "stages": 51000000,
//     "livestages": 21000000,
//     "forms": null,
//     "emails": 1000000,
//     "submissionRequests": 1000000,
//     "formRequests": null,
//     "pdfs": 1000000,
//     "pdfDownloads": 1000000,
//     "apiServers": 1000000,
//     "pdfServers": 1000000,
//     "formManagers": 1000000,
//     "vpats": null,
//     "plan": "commercial",
//     "startDate": "2021-03-07T06:00:00.000Z",
//     "endDate": null,
//     "options": {
//       "sac": true,
//       "vpat": true,
//       "evaluation": false
//     }
//   },
//   "keys": {
//     "mj2ZRYgZCeZpVv5yyegpBOGkjpXB7": {
//       "name": "Environment",
//       "scope": [
//         "project",
//         "form",
//         "stage",
//         "formRequest",
//         "email",
//         "pdf",
//         "pdfDownload",
//         "submissionRequest",
//         "apiServer",
//         "tenant",
//         "dbt",
//         "formManager",
//         "pdfServer",
//         "vpat"
//       ],
//       "key": "mj2ZRYgZCeZpVv5yyegpBOGkjpXB7"
//     }
//   }
// }
