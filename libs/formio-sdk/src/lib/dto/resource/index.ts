import { LicenseDataDTO, UserDataDTO } from '../../dto';
import { SubmissionDTO } from '..';

export * from './license';
export * from './UserData.dto';
export * from './LicenseData.dto';
export * from './ResourceSettings.dto';

/**
 * Built types
 */
export class LicenseDTO extends SubmissionDTO<LicenseDataDTO> {}
export class UserDTO extends SubmissionDTO<UserDataDTO> {}
