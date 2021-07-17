import {
  LIB_AUTHENTICATION,
  LIB_FORMIO_SDK,
  LIB_HOME_ASSISTANT,
  LIB_PERSISTENCE,
  LIB_SERVER,
  LIB_UTILS,
} from '../constants';
import { AuthenticationConfig } from './authentication';
import { FormioSDKConfig } from './formio-sdk';
import { HomeAssistantConfig } from './home-assistant';
import { PersistenceConfig } from './persistence';
import { ServerConfig } from './server';
import { UtilsConfig } from './utils';

export * from './apps';
export * from './authentication';
export * from './automagical';
export * from './common';
export * from './external';
export * from './formio-sdk';
export * from './persistence';
export * from './server';
export * from './utils';

export const CONFIGURABLE_LIBS = new Map(
  Object.entries({
    [LIB_AUTHENTICATION.description]: AuthenticationConfig,
    [LIB_FORMIO_SDK.description]: FormioSDKConfig,
    [LIB_PERSISTENCE.description]: PersistenceConfig,
    [LIB_SERVER.description]: ServerConfig,
    [LIB_UTILS.description]: UtilsConfig,
    [LIB_HOME_ASSISTANT.description]: HomeAssistantConfig,
  }),
);
