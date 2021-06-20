import { ApiParam } from '@nestjs/swagger';

/**
 * Listing of keys used to apply metadata to routes with
 */
export enum SERVER_METADATA {
  ACCESS_TYPE = 'ACCESS_TYPE',
  ACCESS_LEVEL = 'ACCESS_LEVEL',
  ACTION_TYPE = 'ACTION_TYPE',
  LICENSE_TRACK_TYPE = 'LICENSE_TRACK_TYPE',
  PRIMARY_IDENTIFIER = 'PRIMARY_IDENTIFIER',
  LICENSE_WATCH = 'LICENSE_WATCH',
  EMIT_AFTER = 'EMIT_AFTER',
  RES_LOCAL_KEY = 'RES_LOCAL_KEY',
}

export enum ACCESS_TYPE {
  submission = 'submission',
  project = 'project',
  form = 'form',
}

export enum ACCESS_LEVEL {
  create = 'create',
  delete = 'delete',
  admin = 'admin',
  write = 'write',
  read = 'read',
  team_admin = 'team_admin',
  team_write = 'team_write',
  team_read = 'team_read',
  team_access = 'team_access',
}

export enum ACTION_METHOD {
  create = 'create',
  update = 'update',
  read = 'read',
  delete = 'delete',
  index = 'index',
}

export enum PATH_PARAMETERS {
  revisionNumber = 'revisionNumber',
  submissionId = 'submissionId',
  projectName = 'projectName',
  actionName = 'actionName',
  projectId = 'projectId',
  actionId = 'actionId',
  formName = 'formName',
  teamId = 'teamId',
  formId = 'formId',
  roleId = 'roleId',
}

export const SwaggerParameters = (
  ...parameters: PATH_PARAMETERS[]
): MethodDecorator => {
  return (...decoratorArguments) => {
    parameters.forEach((name) => {
      return ApiParam({
        name,
        required: true,
      })(...decoratorArguments);
    });
  };
};
