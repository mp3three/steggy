import { SubmissionDTO } from '../formio-sdk';
import { LicenseMetadataDTO } from './metadata';
import { LicenseDataDTO } from './terms.dto';

// export * from './old';
export * from './key.dto';
export * from './options.dto';
export * from './scopes';
export * from './terms.dto';
export * from './trackables';
export * from './tracked-item.dto';

export class LicenseDTO extends SubmissionDTO<
  LicenseDataDTO,
  LicenseMetadataDTO
> {
  // #region Object Properties

  public data: LicenseDataDTO;
  public metadata: LicenseMetadataDTO;

  // #endregion Object Properties
}
