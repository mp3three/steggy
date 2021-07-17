export enum ACCESS_TYPES {
  create = 'create',
  update = 'update',
  delete = 'delete',
  write = 'write',
  admin = 'admin',
  read = 'read',
}

export enum VALUE_TYPES {
  '[string]' = '[string]',
  '[number]' = '[number]',
  'string' = 'string',
  'number' = 'number',
  'boolean' = 'boolean',
}

export enum OPERATORS {
  lte = '$lte',
  gte = '$gte',
  eq = '$eq',
  lt = '$lt',
  gt = '$gt',
  in = '$in',
}

export enum PROJECT_PLAN_TYPES {
  independent = 'independent',
  commercial = 'commercial',
  trial = 'trial',
  basic = 'basic',
  team = 'team',
}

export enum PROJECT_TYPES {
  project = 'project',
  tenant = 'tenant',
  stage = 'stage',
}

/**
 * As listed in formio-server at least 🤷‍♂️
 */
export enum PROJECT_FRAMEWORKS {
  javascript = 'javascript',
  angular2 = 'angular2',
  aurelia = 'aurelia',
  angular = 'angular',
  simple = 'simple',
  custom = 'custom',
  html5 = 'html5',
  react = 'react',
  vue = 'vue',
}

export enum HANDLERS {
  before = 'before',
  after = 'after',
}
export enum ACTION_CONDITION_EQ {
  // TODO: notEqual => notEquals (consistency update, will that break anything?)
  notEqual = 'notEqual',
  equals = 'equals',
}

export enum ACTION_NAMES {
  email = 'email',
  login = 'login',
  resetPassword = 'reset-password',
  save = 'save',
  sqlConnector = 'sql-connector',
  webhook = 'webhook',
  role = 'role',
}

/**
 * @FIXME: Fill in rest of values
 */
export enum SUBMISSION_STATES {
  submitted = 'submitted',
  testing = 'testing',
}

/**
 * Not all of these will make sense in every use case
 */
export enum PERMISSION_ACCESS_TYPES {
  team_admin = 'team_admin',
  team_write = 'team_write',
  team_read = 'team_read',
  team_access = 'team_access',

  create_all = 'create_all',
  read_all = 'read_all',
  update_all = 'update_all',
  delete_all = 'delete_all',

  create_own = 'create_own',
  read_own = 'read_own',
  update_own = 'update_own',
  delete_own = 'delete_own',

  self = 'self',
  owner = 'owner',
}

export enum ACCESS_PERMISSION {
  admin = 'admin',
}

export enum ACTION_STATES {
  inprogress = 'inprogress',
  complete = 'complete',
  error = 'error',
  new = 'new',
}
