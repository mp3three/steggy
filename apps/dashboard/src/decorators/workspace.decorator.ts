import { LeftMenuService } from '../services';
import { Workspace } from '../typings';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any , @typescript-eslint/ban-types */
export function LoadWorkspace(menu: string[]) {
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
        LoadWorkspace.AVAILABLE_WORKSPACES.set(this, {
          menu,
          name: super.constructor.name,
        });
      }
    };
  };
}
LoadWorkspace.AVAILABLE_WORKSPACES = new Map<
  Workspace,
  { name: string; menu: string[] }
>();

export function WorkspaceElement(): PropertyDecorator {
  return function (target, key: string) {
    const elements =
      LeftMenuService.WORKSPACE_ELEMENTS.get(target.constructor.name) ?? [];
    elements.push(key);
    LeftMenuService.WORKSPACE_ELEMENTS.set(target.constructor.name, elements);
  };
}
