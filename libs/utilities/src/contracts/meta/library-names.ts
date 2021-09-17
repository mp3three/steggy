// These characters are banned from app symbol descriptions due to breaking functionality with configuration:
// -_.

export const APP_DASHBOARD = Symbol('dashboard');
export const APP_DEVTOOLS = Symbol('devtools');
export const APP_LIVING_DOCS = Symbol('living-docs');
export const APP_HOME_CONTROLLER = Symbol('home-controller');

export const LIB_AUTHENTICATION = Symbol('authentication');
export const LIB_CONTRACTS = Symbol('contracts');
export const LIB_CONTROLLER_LOGIC = Symbol('controller-logic');
export const LIB_HOME_ASSISTANT = Symbol('home-assistant');
export const LIB_PORTAINER = Symbol('portainer');
export const LIB_1PASSWORD = Symbol('1password');
export const LIB_TERMINAL = Symbol('terminal');
export const LIB_TTY = Symbol('tty');
export const LIB_SERVER = Symbol('server');
export const LIB_TESTING = Symbol('testing');
export const LIB_UTILS = Symbol('utilities');

export const APPLICATION_LIST = [
  APP_HOME_CONTROLLER.description,
  APP_DEVTOOLS.description,
  APP_LIVING_DOCS.description,
  APP_DASHBOARD.description,
];

export const APPLICATION_SYMBOL_MAP = new Map(
  Object.entries({
    [APP_HOME_CONTROLLER.description]: APP_HOME_CONTROLLER,
    [APP_DEVTOOLS.description]: APP_DEVTOOLS,
    [APP_LIVING_DOCS.description]: APP_LIVING_DOCS,
    [APP_DASHBOARD.description]: APP_DASHBOARD,
  }),
);

export const LIBRARY_LIST = [
  LIB_AUTHENTICATION.description,
  LIB_CONTRACTS.description,
  LIB_CONTROLLER_LOGIC.description,
  LIB_HOME_ASSISTANT.description,
  LIB_TERMINAL.description,
  LIB_TTY.description,
  LIB_PORTAINER.description,
  LIB_SERVER.description,
  LIB_TESTING.description,
  LIB_UTILS.description,
];