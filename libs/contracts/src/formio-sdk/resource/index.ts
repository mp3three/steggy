import { UserDataDTO } from '@automagical/contracts';
import { SubmissionDTO } from '..';
import { UtilizationResponseTermsDTO } from '../../licenses/terms.dto';

export * from './LicenseAdmin.dto';
export * from './ResourceSettings.dto';
export * from './UserData.dto';

/**
 * Built types
 */
export class LicenseDTO extends SubmissionDTO<UtilizationResponseTermsDTO> {}
export class UserDTO extends SubmissionDTO<UserDataDTO> {}
