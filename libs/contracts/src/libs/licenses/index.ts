import { SubmissionDTO } from '../formio-sdk';
import { LicenseDataDTO } from './license.dto';

// export * from './old';
export * from './license.dto';
export * from './trackables';

export class LicenseDTO extends SubmissionDTO<LicenseDataDTO> {
  // #region Object Properties

  public data: LicenseDataDTO;

  // #endregion Object Properties
}
