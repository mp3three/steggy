import { LicenseDataDTO, UserDataDTO } from '@automagical/contracts';
import { SubmissionDTO } from '..';

export * from './UserData.dto';
export * from './LicenseAdmin.dto';
export * from './LicenseData.dto';
export * from './ResourceSettings.dto';

/**
 * Built types
 */
export class LicenseDTO extends SubmissionDTO<LicenseDataDTO> {}
export class UserDTO extends SubmissionDTO<UserDataDTO> {}
