import {
  WORKSPACE_SETTINGS,
  WorkspaceSettingsDTO,
} from '@automagical/contracts/terminal';
import { ConsumesConfig } from '@automagical/utilities';
import { ScopeOptions } from '@nestjs/common';

export function Workspace(
  settings: WorkspaceSettingsDTO,
  config?: string[],
  scope?: ScopeOptions,
): ClassDecorator {
  return function (target) {
    target[WORKSPACE_SETTINGS] = settings;
    return ConsumesConfig(config, scope)(target);
  };
}
