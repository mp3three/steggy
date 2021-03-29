/**
 * ## Description
 *
 * This is the master interface for `process.env` inside of the repo.
 * If there are any defaults to any of the variables, they will exist in one of two locations.
 *
 * ### Libraries & NPM Modules
 *
 * **File Location**: `/.env`
 *
 * **Description**: Most code will pull from here. This file does not represent a recommended minimum set of variables, just those with sane defaults.
 *
 * ### Applications
 *
 * **File Location**: `/apps/{app_name}/.env`
 *
 * **Description**: If a specific application needs to define an environment variable that is used nowhere else in the repo, it goes here.
 *
 * ## Providing your own values: developers
 *
 * ### Files
 *
 * - `/.local.env`
 * - `/apps/{app_name}/.local.env`
 *
 * Local environment files are covered under .gitignore
 *
 * ### Resolution order
 *
 * First file to provide a value wins
 *
 * - `/apps/{app_name}/.local.env`
 * - `/apps/{app_name}/.env`
 * - `/.local.env`
 * - `/.env`
 *
 * ## Adding new variables
 *
 * ### By Hand
 *
 * **Format**: (LIBRARY_NAME_)PROPERTY_WITH_SPACES(_attribute)
 *
 * Follow the documentation convention
 *
 * ### Workspace Generator
 *
 * WIP feature, will be the preferred method when complete.
 *
 * - `nx workspace-schematic environment`
 * - VSCode Nx Console
 *  - nx generate (ui) > workspace-schematic - environemnt
 *
 * ## Examples
 *
 * - DEBUG
 * - FORMIO_SDK_API_KEY
 * - FORMIO_SDK_AUTH_password
 *
 * TODO: attribute notation not correctly implemented in several variables
 * TODO: some incorrectly formatted or missing library names
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
   * Allow the license server owner view api response on behalf of customer
   *
   * Requests contain licence data (utilization counts, environment metadata)
   *
   * @see `@automagical/licenses`
   */
  public LICENSES_ADMIN_TOKEN: string;
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
   * Header name
   *
   * @see `@automagical/licenses`
   */
  public LICENSES_TOKEN_HEADER: string;
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
