import { APP_API_SERVER, LIB_LICENSES } from '../constants';
import { CreateAnnotation } from '../decorators';

const UsesConfig = CreateAnnotation(LIB_LICENSES.description);
export class LicenseConfig {
  // #region Object Properties

  /**
   * The key that ties this environment to your license
   */
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'default',
    },
  })
  public LICENSE_KEY?: string;
  /**
   * Temporary override for licensing
   */
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'hidden',
    },
    type: 'boolean',
  })
  public _DEV_MODE?: boolean;

  protected ENVIRONMENT_ID_KEY?: string;
  protected ENVIRONMENT_SOURCE?: 'remote' | 'mongo';
  protected LICENSE_SERVER?: string;

  // #endregion Object Properties
}

export const LICENSE_SERVER = 'libs.license.LICENSE_SERVER';
export const LICENSE_SERVER_DEV_MODE = 'libs.license._DEV_MODE';
export const LICENSE_KEY = 'libs.license.LICENSE_KEY';
export const ENVIRONMENT_ID_KEY = 'libs.license.ENVIRONMENT_ID_KEY';
export const DEFAULT_LICENSE_SERVER = 'https://localhost:3004';
