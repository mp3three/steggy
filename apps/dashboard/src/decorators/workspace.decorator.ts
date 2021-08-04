import { LeftMenuService } from '../services';
import { Workspace } from '../typings';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any , @typescript-eslint/ban-types */
export function LoadWorkspace() {
  return function <T extends { new (...arguments_: any[]): Workspace }>(
    constructor: T,
  ) {
    const name = constructor.name;
    return class extends constructor {
      protected __name = name;
      protected async onModuleInit() {
        if (super['onModuleInit']) {
          await super['onModuleInit']();
        }
        LeftMenuService.AVAILABLE_WORKSPACES.set(this, super.constructor.name);
      }
    };
  };
}
export function WorkspaceElement(): PropertyDecorator {
  return function (target, key: string) {
    const elements =
      LeftMenuService.WORKSPACE_ELEMENTS.get(target.constructor.name) ?? [];
    elements.push(key);
    LeftMenuService.WORKSPACE_ELEMENTS.set(target.constructor.name, elements);
  };
}
