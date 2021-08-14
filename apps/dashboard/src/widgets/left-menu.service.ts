import {
  BLESSED_GRID,
  GridElement,
  iWorkspace,
  Tree,
  TreeElement,
  TreeOptions,
} from '@automagical/contracts/terminal';
import { RefreshAfter, WorkspaceExplorerService } from '@automagical/terminal';
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
        const settings = this.workspaceExplorer.workspaces.get(workspace);
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
        if (settings.defaultWorkspace) {
          setTimeout(() => {
            this.onTreeSelect(workspace);
          }, 10);
        }
      });
    });
    this.renderTree();
    this.TREE.setData({ ...this.treeData, extended: true });
  }

  // #endregion Protected Methods

  // #region Private Methods

  @RefreshAfter()
  // TODO: fixme
  // eslint-disable-next-line radar/cognitive-complexity
  private async onTreeSelect(workspace: iWorkspace): Promise<void> {
    try {
      if (!workspace) {
        return;
      }
      if (this.activeWorkspace && this.activeWorkspace !== workspace) {
        this.workspaceExplorer.elements
          .get(this.activeWorkspace)
          ?.forEach((settings, key) => {
            if (
              !this.activeWorkspace[key] ||
              this.activeWorkspace[key].hidden
            ) {
              return;
            }
            this.activeWorkspace[key]?.hide();
          });
        this.workspaceExplorer.internalElements
          .get(this.activeWorkspace)
          ?.forEach((element) => {
            if (element.hidden) {
              return;
            }
            element.hide();
          });

        if (workspace.onHide) {
          await workspace.onHide();
        }
      }
      this.workspaceExplorer.elements
        .get(workspace)
        .forEach((settings, key) => {
          if (!workspace[key] || !workspace[key].hidden) {
            return;
          }
          workspace[key]?.show();
        });

      this.workspaceExplorer.internalElements
        .get(workspace)
        ?.forEach((element) => {
          if (!element || !element.hidden) {
            return;
          }
          element.show();
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
      selectedBg: 'red',
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
