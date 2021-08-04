import { Tree } from '@automagical/contracts/terminal';
import { Inject, Injectable } from '@nestjs/common';
import { Widgets as ContribWidgets } from 'blessed-contrib';

import { BLESSED_GRID, GridElement, Workspace } from '../typings';

@Injectable()
export class LeftMenuService {
  // #region Static Properties

  public static readonly AVAILABLE_WORKSPACES = new Map<Workspace, string>();
  public static readonly WORKSPACE_ELEMENTS = new Map<string, string[]>();

  // #endregion Static Properties

  // #region Object Properties

  public activeWorkspace: Workspace;

  private TREE: ContribWidgets.TreeElement;
  private treeData: Pick<ContribWidgets.TreeOptions, 'children'> = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(@Inject(BLESSED_GRID) private readonly grid: GridElement) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onApplicationBootstrap(): void {
    LeftMenuService.AVAILABLE_WORKSPACES.forEach((name, workspace) => {
      let next: Record<string, unknown> = this.treeData;
      const length = workspace.menuPosition.length;
      workspace.menuPosition.forEach((menuItem, index) => {
        if (typeof next.children === 'undefined') {
          next.children = {};
        }
        if (typeof next.children[menuItem] === 'undefined') {
          next.children[menuItem] = {};
          if (index === length - 1) {
            next.children[menuItem] = {
              workspace: name,
            };
          }
        }
        next = next.children[menuItem];
        if (menuItem === 'Loft') {
          setTimeout(() => {
            this.onTreeSelect(workspace);
          }, 10);
        }
      });
    });
    this.renderTree();
    // ts definitions are wrong here
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.TREE.setData({ ...this.treeData, extended: true });
  }

  // #endregion Protected Methods

  // #region Private Methods

  private onTreeSelect(workspace: Workspace): void {
    try {
      if (!workspace) {
        return;
      }
      if (this.activeWorkspace) {
        const activeName = LeftMenuService.AVAILABLE_WORKSPACES.get(
          this.activeWorkspace,
        );
        LeftMenuService.WORKSPACE_ELEMENTS.get(activeName)?.forEach(
          (element) => {
            this.activeWorkspace[element]?.hide();
          },
        );
      }
      const name = LeftMenuService.AVAILABLE_WORKSPACES.get(workspace);

      LeftMenuService.WORKSPACE_ELEMENTS.get(name)?.forEach((element) => {
        workspace[element]?.show();
      });
      workspace.show();
      this.activeWorkspace = workspace;
    } catch (error) {
      console.log(error);
    }
  }

  private renderTree(): void {
    this.TREE = this.grid.set(0, 0, 12, 2, Tree, {
      label: 'Application Menu',
      mouse: true,
    });
    this.TREE.border.fg = 120;
    this.TREE.focus();
    this.TREE.on('select', (node) => {
      const workspace = [
        ...LeftMenuService.AVAILABLE_WORKSPACES.entries(),
      ].find(([, name]) => name === node.workspace)[0];
      try {
        this.onTreeSelect(workspace);
      } catch (error) {
        console.log(error);
      }
    });
  }

  // #endregion Private Methods
}
