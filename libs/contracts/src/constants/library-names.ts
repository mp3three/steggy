// These characters are banned from app symbol names due to breaking functionality elsewhere:
// -_.

export const APP_LICENSE_SERVER = Symbol('license');
export const APP_API_SERVER = Symbol('api');
export const APP_SQL_CONNECTOR = Symbol('sqlconnector');
export const APP_DEVTOOLS = Symbol('devtools');
export const APP_LIVING_DOCS = Symbol('livingdocs');
export const APP_SUPPORT_TOOLS = Symbol('support');

// Make sure these line up with lib names in config/index.ts if adding
export const LIB_ACTION = Symbol('action');
export const LIB_AUTHENTICATION = Symbol('authentication');
export const LIB_CONTRACTS = Symbol('contracts');
export const LIB_FORMIO_SDK = Symbol('formiosdk');
export const LIB_LICENSES = Symbol('licenses');
export const LIB_PERSISTENCE = Symbol('persistence');
export const LIB_SERVER = Symbol('server');
export const LIB_TESTING = 'jest-test';
export const LIB_UTILS = Symbol('utils');
export const LIB_WRAPPER = Symbol('wrapper');

export const APPLICATION_LIST = [
  APP_API_SERVER.description,
  APP_DEVTOOLS.description,
  APP_LICENSE_SERVER.description,
  APP_SQL_CONNECTOR.description,
  APP_LIVING_DOCS.description,
  APP_SUPPORT_TOOLS.description,
];

export const APPLICATION_SYMBOL_MAP = new Map(
  Object.entries({
    [APP_API_SERVER.description]: APP_API_SERVER,
    [APP_DEVTOOLS.description]: APP_DEVTOOLS,
    [APP_LICENSE_SERVER.description]: APP_LICENSE_SERVER,
    [APP_SQL_CONNECTOR.description]: APP_SQL_CONNECTOR,
    [APP_SUPPORT_TOOLS.description]: APP_SUPPORT_TOOLS,
  }),
);
export const LIBRARY_LIST = [
  LIB_ACTION.description,
  LIB_AUTHENTICATION.description,
  LIB_CONTRACTS.description,
  LIB_FORMIO_SDK.description,
  LIB_LICENSES.description,
  LIB_PERSISTENCE.description,
  LIB_SERVER.description,
  LIB_TESTING,
  LIB_UTILS.description,
  LIB_WRAPPER.description,
];
