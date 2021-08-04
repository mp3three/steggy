import { Tree } from '@automagical/contracts/terminal';
import { RefreshAfter } from '@automagical/terminal';
import { Inject, Injectable } from '@nestjs/common';
import { Widgets as ContribWidgets } from 'blessed-contrib';

import { BLESSED_GRID, GridElement, Workspace } from '../typings';

@Injectable()
export class LeftMenuService {
  // #region Object Properties

  public activeWorkspace: Workspace;

  private TREE: ContribWidgets.TreeElement;
  private treeData: Pick<ContribWidgets.TreeOptions, 'children'> = {};
  private workspaces = new Map<string, Workspace>();

  // #endregion Object Properties

  // #region Constructors

  constructor(@Inject(BLESSED_GRID) private readonly grid: GridElement) {}

  // #endregion Constructors

  // #region Public Methods

  public addMenuItem(item: Workspace): void {
    const { name } = item.constructor;
    this.workspaces.set(name, item);

    let next: Record<string, unknown> = this.treeData;
    const length = item.menuPosition.length;
    item.menuPosition.forEach((menuItem, index) => {
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
    });
    // ts definitions are wrong here
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.TREE.setData({ ...this.treeData, extended: true });
  }

  // #endregion Public Methods

  // #region Protected Methods

  @RefreshAfter()
  protected onApplicationBootstrap(): void {
    this.TREE = this.grid.set(0, 0, 12, 2, Tree, {
      label: 'Application Menu',
      mouse: true,
    });
    this.TREE.border.fg = 120;
    this.TREE.focus();
    this.TREE.on('select', (node) => {
      try {
        this.onTreeSelect(this.workspaces.get(node.workspace));
      } catch (error) {
        console.log(error);
      }
    });
  }

  // #endregion Protected Methods

  // #region Private Methods

  private onTreeSelect(workspace: Workspace): void {
    if (!workspace) {
      return;
    }
    this.activeWorkspace?.toggleVisibility();
    workspace.toggleVisibility();
  }

  // #endregion Private Methods
}
