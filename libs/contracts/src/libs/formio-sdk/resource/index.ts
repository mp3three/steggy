import { SubmissionDTO, UserDataDTO } from '..';
import { UtilizationResponseTermsDTO } from '../../licenses/terms.dto';

export * from './LicenseAdmin.dto';
export * from './ResourceSettings.dto';
export * from './UserData.dto';

/**
 * Built types
 */
export class LicenseDTO extends SubmissionDTO<UtilizationResponseTermsDTO> {}
export class UserDTO extends SubmissionDTO<UserDataDTO> {}
