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
