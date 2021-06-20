export class LicenseConfig {
  // #region Object Properties

  ENVIRONMENT_ID_KEY?: string;
  ENVIRONMENT_SOURCE?: 'remote' | 'mongo';
  LICENSE_KEY?: string;
  LICENSE_SERVER?: string;
  _DEV_MODE?: boolean;

  // #endregion Object Properties
}

export const LICENSE_SERVER = 'libs.license.LICENSE_SERVER';
export const LICENSE_SERVER_DEV_MODE = 'libs.license._DEV_MODE';
export const LICENSE_KEY = 'libs.license.LICENSE_KEY';
export const ENVIRONMENT_ID_KEY = 'libs.license.ENVIRONMENT_ID_KEY';
export const DEFAULT_LICENSE_SERVER = 'https://localhost:3004';
