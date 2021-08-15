import {
  APP_DASHBOARD,
  APP_DEVTOOLS,
  APP_HOME_CONTROLLER,
  LIB_AUTHENTICATION,
  LIB_CONTROLLER_LOGIC,
  LIB_FORMIO_SDK,
  LIB_HOME_ASSISTANT,
  LIB_SERVER,
  LIB_UTILS,
} from '..';
import { LIB_TERMINAL } from '../library-names';
import {
  DashboardApplicationSettingsDTO,
  DevtoolsApplicationSettingsDTO,
  HomeControllerApplicationSettingsDTO,
} from './apps';
import { AuthenticationConfig } from './authentication';
import { CustomLogicConfig } from './controller-logic';
import { FormioSDKConfig } from './formio-sdk';
import { HomeAssistantConfig } from './home-assistant';
import { ServerConfig } from './server';
import { TerminalConfig } from './terminal';
import { UtilsConfig } from './utils';

export * from './apps';
export * from './authentication';
export * from './automagical';
export * from './common';
export * from './controller-logic';
export * from './external';
export * from './formio-sdk';
export * from './home-assistant';
export * from './libs-config';
export * from './server';
export * from './terminal';
export * from './utils';

export const ACTIVE_APPLICATION = Symbol('ACTIVE_APPLICATION');

export type ApplicationConfigs =
  | DashboardApplicationSettingsDTO
  | HomeControllerApplicationSettingsDTO
  | DevtoolsApplicationSettingsDTO;

export const CONFIGURABLE_APPS = new Map(
  Object.entries({
    [APP_DASHBOARD.description]: DashboardApplicationSettingsDTO,
    [APP_DEVTOOLS.description]: DevtoolsApplicationSettingsDTO,
    [APP_HOME_CONTROLLER.description]: HomeControllerApplicationSettingsDTO,
  }),
);

export const CONFIGURABLE_LIBS = new Map(
  Object.entries({
    [LIB_CONTROLLER_LOGIC.description]: CustomLogicConfig,
    [LIB_AUTHENTICATION.description]: AuthenticationConfig,
    [LIB_FORMIO_SDK.description]: FormioSDKConfig,
    [LIB_SERVER.description]: ServerConfig,
    [LIB_UTILS.description]: UtilsConfig,
    [LIB_TERMINAL.description]: TerminalConfig,
    [LIB_HOME_ASSISTANT.description]: HomeAssistantConfig,
  }),
);
