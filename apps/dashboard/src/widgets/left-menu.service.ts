import {
  BLESSED_GRID,
  GridElement,
  iWorkspace,
  RefreshAfter,
  Tree,
  TreeElement,
  TreeOptions,
  WorkspaceExplorerService,
} from '@automagical/terminal';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
} from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';

const CACHE_KEY = 'LEFTMENU:activeWorkspace';

@Injectable()
export class LeftMenuService {
  public activeWorkspace: iWorkspace;

  private TREE: TreeElement;
  private treeData: Pick<TreeOptions, 'children'> = {};

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    private readonly workspaceExplorer: WorkspaceExplorerService,
    @InjectCache()
    private readonly cacheService: CacheManagerService,
    private readonly logger: AutoLogService,
  ) {}

  protected async onApplicationBootstrap(): Promise<void> {
    const activeName = await this.cacheService.get(CACHE_KEY);
    this.workspaceExplorer.workspaces.forEach(({ name, menu }, workspace) => {
      let next: Record<string, unknown> = this.treeData;
      const length = menu.length;
      menu.forEach((menuItem, index) => {
        const settings = this.workspaceExplorer.workspaces.get(workspace);
        if (settings.name === activeName) {
          process.nextTick(() => {
            this.onTreeSelect(workspace);
            this.logger.debug(`[${settings.friendlyName}] Restoring workspace`);
          });
        }
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
    });
    this.renderTree();
    this.TREE.setData({ ...this.treeData, extended: true });
  }

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
      const settings = this.workspaceExplorer.workspaces.get(workspace);
      await this.cacheService.set(CACHE_KEY, settings.name);
    } catch (error) {
      this.logger.error({ error });
    }
  }

  private renderTree(): void {
    this.TREE = this.grid.set(0, 0, 12, 2, Tree, {
      label: 'Application Menu',
      mouse: true,
      selectedBg: 'red',
      selectedFg: 'white',
    } as TreeOptions);
    this.TREE.border.fg = 120;
    this.TREE.focus();
    this.TREE.on('select', (node) => {
      const workspace = [...this.workspaceExplorer.workspaces.entries()].find(
        ([, { name }]) => {
          return name === node.workspace;
        },
      );
      try {
        if (!workspace) {
          this.logger.debug(`No callback for {${node.name.trim()}}`);
          return;
        }
        this.onTreeSelect(workspace[0]);
      } catch (error) {
        this.logger.error({ error });
      }
    });
  }
}
