import {
  BLESSED_GRID,
  GridElement,
  iWorkspace,
  Tree,
  TreeElement,
  TreeOptions,
} from '@automagical/contracts/terminal';
import { WorkspaceExplorerService } from '@automagical/terminal';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LeftMenuService {
  // #region Object Properties

  public activeWorkspace: iWorkspace;

  private TREE: TreeElement;
  private treeData: Pick<TreeOptions, 'children'> = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    private readonly workspaceExplorer: WorkspaceExplorerService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onApplicationBootstrap(): void {
    this.workspaceExplorer.workspaces.forEach(({ name, menu }, workspace) => {
      let next: Record<string, unknown> = this.treeData;
      const length = menu.length;
      menu.forEach((menuItem, index) => {
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

  private async onTreeSelect(workspace: iWorkspace): Promise<void> {
    try {
      if (!workspace) {
        return;
      }
      if (this.activeWorkspace) {
        this.workspaceExplorer.elements
          .get(this.activeWorkspace)
          .forEach((settings, key) => {
            this.activeWorkspace[key]?.hide();
          });

        if (workspace.onHide) {
          await workspace.onHide();
        }
      }
      this.workspaceExplorer.elements
        .get(workspace)
        .forEach((settings, key) => {
          workspace[key]?.show();
        });

      if (workspace.onShow) {
        await workspace.onShow();
      }
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
      const workspace = [...this.workspaceExplorer.workspaces.entries()].find(
        ([, { name }]) => {
          return name === node.workspace;
        },
      )[0];
      try {
        this.onTreeSelect(workspace);
      } catch (error) {
        console.log(error);
      }
    });
  }

  // #endregion Private Methods
}
