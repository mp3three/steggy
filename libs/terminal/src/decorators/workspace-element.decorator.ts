import {
  WORKSPACE_ELEMENT,
  WorkspaceElementSettingsDTO,
} from '@automagical/contracts/terminal';

export function WorkspaceElement(
  options: WorkspaceElementSettingsDTO = {},
): PropertyDecorator {
  return function (target, key) {
    const keys = target.constructor[WORKSPACE_ELEMENT] ?? new Map();
    keys.set(key, options);
    target.constructor[WORKSPACE_ELEMENT] = keys;
  };
}
