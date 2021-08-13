import {
  WORKSPACE_SETTINGS,
  WorkspaceSettingsDTO,
} from '@automagical/contracts/terminal';
import { Injectable } from '@nestjs/common';

export function Workspace(settings: WorkspaceSettingsDTO): ClassDecorator {
  return function (target) {
    target[WORKSPACE_SETTINGS] = settings;
    return Injectable()(target);
  };
}
