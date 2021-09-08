import {
  WORKSPACE_SETTINGS,
  WorkspaceSettingsDTO,
} from '@automagical/contracts/terminal';
import { Injectable, ScopeOptions } from '@nestjs/common';

export function Workspace(
  settings: WorkspaceSettingsDTO,
  scope?: ScopeOptions,
): ClassDecorator {
  return function (target) {
    target[WORKSPACE_SETTINGS] = settings;
    return Injectable(scope)(target);
  };
}
