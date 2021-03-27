/**
 * All of these are shared by the libs folder.
 * This file should be kept in sync with the `.env` file in the repo root.
 *
 * In development environments, store your overrides in `.local.env` in the repo root.
 *
 * (LIBRARY_NAME_)PROPERTY_WITH_SPACES(_attribute)
 *
 * - DEBUG
 * - FORMIO_SDK_API_KEY
 * - SOME_LIBARARY_AUTH_password
 */
export class ProcessEnvDTO {
  // #region Object Properties

  /**
   * npm lib: debug
   *
   * @default *
   */
  public DEBUG: string;
  /**
   * @see `@automagical/licenses`
   * @default true
   */
  public FORMIO_HOSTED: string;
  /**
   * Sent along with requests to provide access to the API server
   *
   *  @see `@automagical/formio-sdk`
   */
  public FORMIO_SDK_API_KEY: string;
  /**
   * The controlling license server for the api server
   *
   * @default "https://license.form.io"
   * @see `@automagical/formio-sdk`
   */
  public FORMIO_SDK_LICENSE_SERVER_base_url: string;
  /**
   * User login for the portal
   *
   * @see `@automagical/formio-sdk`
   * @example you@your.domain
   */
  public FORMIO_SDK_LOGIN_EMAIL: string;
  /**
   * User password for the portal
   *
   * @default "super secret password"
   * @see "@automagical/formio-sdk"
   */
  public FORMIO_SDK_LOGIN_PASSWORD: string;
  /**
   * @default "formio"
   * @see `@automagical/formio-sdk`
   */
  public FORMIO_SDK_PORTAL_BASE_PROJECT: string;
  /**
   * @see `@automagical/formio-sdk`
   * @default "https://portal.form.io"
   */
  public FORMIO_SDK_PORTAL_BASE_URL: string;
  /**
   * @example "https://homeassistant.your.domain"
   * @see `@automagical/home-assistant`
   */
  public HOMEASSISTANT_HOST: string;
  /**
   * API Token
   */
  public HOMEASSISTANT_TOKEN: string;
  /**
   * Connection param
   *
   * @see `@automagical/licenses`
   */
  public LICENSES_REDIS_HOST: string;
  /**
   * Connection param
   *
   * @see `@automagical/licenses`
   */
  public LICENSES_REDIS_PASSWORD: string;
  /**
   * Connection param
   *
   * @see `@automagical/licenses`
   */
  public LICENSES_REDIS_PORT: string;
  /**
   * Connection param
   *
   * @see `@automagical/licenses`
   */
  public LICENSES_REDIS_URL: string;
  /**
   * Connection param
   *
   * @see `@automagical/licenses`
   */
  public LICENSES_REDIS_USESSL: string;
  /**
   * @see `@automagical/logger`
   */
  public LOG_PREFIX: string;
  /**
   * MQTT host provider.
   *
   * TODO: Categorize in a sane way
   *
   * @see `@automagical/home-assistant`
   */
  public MQTT_HOST: string;
  /**
   * MQTT port
   *
   * TODO: Categorize in a sane way
   *
   * @see `@automagical/home-assistant`
   */
  public MQTT_PORT: string;
  /**
   * @example production
   */
  public NODE_ENV: string;
  /**
   * Gotta default to somethin
   *
   * @default 3000
   */
  public PORT: string;

  // #endregion Object Properties
}

/**
 * Bind to global so global so typescript know's what's up. Refactors made easy
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends ProcessEnvDTO {}
  }
}

export const env: ProcessEnvDTO = process.env;
