export enum ACCESS_TYPES {
  read = 'read',
  create = 'create',
  update = 'update',
  delete = 'delete',
  write = 'write',
  admin = 'admin',
}

export enum VALUE_TYPES {
  'string' = 'string',
  'number' = 'number',
  'boolean' = 'boolean',
  '[string]' = '[string]',
  '[number]' = '[number]',
}

export enum OPERATORS {
  eq = '$eq',
  lt = '$lt',
  gt = '$gt',
  lte = '$lte',
  gte = '$gte',
  in = '$in',
}

export enum PROJECT_PLAN_TYPES {
  basic = 'basic',
  independent = 'independent',
  team = 'team',
  trial = 'trial',
  commercial = 'commercial',
}

export enum PROJECT_TYPES {
  project = 'project',
  stage = 'stage',
  tenant = 'tenant',
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
export enum HTTP_METHODS {
  create = 'create',
  update = 'update',
  delete = 'delete',
  index = 'index',
}
export enum ACTION_CONDITION_EQ {
  // TODO: notEqual => notEquals (will that break anything?)
  notEqual = 'notEqual',
  equals = 'equals',
}

export enum ActionNames {
  save = 'save',
}
/**
 * @FIXME: Fill in rest of values
 */
export enum SUBMISSION_STATES {
  submitted = 'submitted',
}

export enum AccessTypes {
  teamAdmin = 'team_admin',
  teamWrite = 'team_write',
  teamRead = 'team_read',

  create_all = 'create_all',
  read_all = 'read_all',
  update_all = 'update_all',
  delete_all = 'delete_all',
  create_own = 'create_own',
  read_own = 'read_own',
  update_own = 'update_own',
  delete_own = 'delete_own',
  self = 'self',
}

export enum ACCESS_PERMISSION {
  admin = 'admin',
}

export enum ACTION_STATES {
  new = 'new',
  inprogress = 'inprogress',
  complete = 'complete',
  error = 'error',
}

export enum FORM_TYPES {
  form = 'form',
  resource = 'resource',
}
