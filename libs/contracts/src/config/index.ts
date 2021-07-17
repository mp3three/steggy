import {
  LIB_AUTHENTICATION,
  LIB_FORMIO_SDK,
  LIB_LICENSES,
  LIB_PERSISTENCE,
  LIB_SERVER,
  LIB_UTILS,
  LIB_WRAPPER,
} from '../constants';
import { AuthenticationConfig } from './authentication';
import { FormioSDKConfig } from './formio-sdk';
import { LicenseConfig } from './license';
import { PersistenceConfig } from './persistence';
import { ServerConfig } from './server';
import { UtilsConfig } from './utils';
import { WrapperConfig } from './wrapper';

export * from './apps';
export * from './authentication';
export * from './automagical';
export * from './common';
export * from './external';
export * from './formio-sdk';
export * from './license';
export * from './persistence';
export * from './server';
export * from './utils';
export * from './wrapper';

export const CONFIGURABLE_LIBS = new Map(
  Object.entries({
    [LIB_AUTHENTICATION.description]: AuthenticationConfig,
    [LIB_FORMIO_SDK.description]: FormioSDKConfig,
    [LIB_LICENSES.description]: LicenseConfig,
    [LIB_PERSISTENCE.description]: PersistenceConfig,
    [LIB_SERVER.description]: ServerConfig,
    [LIB_UTILS.description]: UtilsConfig,
    [LIB_WRAPPER.description]: WrapperConfig,
  }),
);
