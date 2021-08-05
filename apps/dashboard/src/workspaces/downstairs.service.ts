import { Box } from '@automagical/contracts/terminal';
import { Inject, Injectable } from '@nestjs/common';
import { Widgets } from 'blessed';
import chalk from 'chalk';
import figlet from 'figlet';

import { LoadWorkspace, WorkspaceElement } from '../decorators';
import { RemoteService } from '../services';
import {
  BLESSED_GRID,
  FIGLET_ROOM_HEADER,
  GridElement,
  Workspace,
} from '../typings';

@Injectable()
@LoadWorkspace(['Downstairs'])
export class DownstairsService implements Workspace {
  // #region Object Properties

  @WorkspaceElement()
  private BOX: Widgets.BoxElement;
  @WorkspaceElement()
  private HEADER: Widgets.BoxElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    private readonly remoteService: RemoteService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public show(): void {
    //
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected onApplicationBootstrap(): void {
    this.remoteService.room = 'downstairs';
    this.BOX = this.remoteService.BOX;
    this.HEADER = this.grid.set(0.5, 2.5, 2, 6, Box, {
      content: chalk.yellowBright(
        figlet.textSync('Downstairs', {
          font: FIGLET_ROOM_HEADER,
        }),
      ),
      hidden: true,
    });
    this.HEADER.border = {};
  }

  // #endregion Protected Methods
}
