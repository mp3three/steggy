// These characters are banned from app symbol names due to breaking functionality elsewhere:
// -_.

export const APP_DEVTOOLS = Symbol('devtools');
export const APP_LIVING_DOCS = Symbol('livingdocs');
export const APP_HOME_CONTROLLER = Symbol('home');

export const LIB_AUTHENTICATION = Symbol('authentication');
export const LIB_CONTRACTS = Symbol('contracts');
export const LIB_CUSTOM = Symbol('custom');
export const LIB_FORMIO_SDK = Symbol('formiosdk');
export const LIB_HOME_ASSISTANT = Symbol('homeassistant');
export const LIB_TERMINAL = Symbol('terminal');
export const LIB_SERVER = Symbol('server');
export const LIB_TESTING = Symbol('testing');
export const LIB_UTILS = Symbol('utils');

export const APPLICATION_LIST = [
  APP_HOME_CONTROLLER.description,
  APP_DEVTOOLS.description,
  APP_LIVING_DOCS.description,
];

export const APPLICATION_SYMBOL_MAP = new Map(
  Object.entries({
    [APP_HOME_CONTROLLER.description]: APP_HOME_CONTROLLER,
    [APP_DEVTOOLS.description]: APP_DEVTOOLS,
    [APP_LIVING_DOCS.description]: APP_LIVING_DOCS,
  }),
);
export const LIBRARY_LIST = [
  LIB_CONTRACTS.description,
  LIB_CUSTOM.description,
  LIB_FORMIO_SDK.description,
  LIB_HOME_ASSISTANT.description,
  LIB_SERVER.description,
  LIB_TERMINAL.description,
  LIB_TESTING.description,
  LIB_UTILS.description,
];
