import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Widgets } from 'blessed';

import { BLESSED_GRID, GridElement, Workspace } from '../typings';
import { LeftMenuService } from './left-menu.service';

@Injectable()
export class WorkspaceService {
  // #region Object Properties

  private SPACES = new Map<Workspace, Widgets.BoxElement>();
  private initialActiveFound = false;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly GRID: GridElement,
    private readonly leftMenu: LeftMenuService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public addSpace<O extends Widgets.BoxOptions, R extends Widgets.BoxElement>(
    object: (options: Record<string, unknown>) => R,
    options: O,
    workspace: Workspace,
  ): R {
    const out = this.GRID.set(
      0,
      2,
      12,
      8,
      object,
      options,
    ) as Widgets.BoxElement;
    this.SPACES.set(workspace, out);
    this.leftMenu.addMenuItem(workspace);
    // out.border = {};
    if (workspace.defaultActive) {
      if (this.initialActiveFound) {
        throw new InternalServerErrorException(
          'Multiple default active panes found',
        );
      }
      out.hide();
      this.initialActiveFound = true;
      this.leftMenu.activeWorkspace = workspace;
    }
    return out as R;
  }

  // #endregion Public Methods
}
