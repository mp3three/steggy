export enum ACCESS_TYPES {
  read = 'read',
  create = 'create',
  update = 'update',
  delete = 'delete',
  write = 'write',
  admin = 'admin',
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

export enum Handers {
  before = 'before',
  after = 'after',
}
export enum Method {
  create = 'create',
  update = 'update',
  delete = 'delete',
  index = 'index',
}
export enum ActionConditionEQ {
  // TODO: notEqual => notEquals
  notEqual = 'notEqual',
  equals = 'equals',
}

export enum ActionNames {
  save = 'save',
}
/**
 * @FIXME: Fill in rest of values
 */
export enum SubmissionStates {
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

export enum AccessPermission {
  admin = 'admin',
}

export enum ACTION_STATES {
  new = 'new',
  inprogress = 'inprogress',
  complete = 'complete',
  error = 'error',
}
