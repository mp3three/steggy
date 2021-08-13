import {
  BLESSED_GRID,
  Box,
  GridElement,
} from '@automagical/contracts/terminal';
import { Workspace, WorkspaceElement } from '@automagical/terminal';
import { Inject } from '@nestjs/common';
import { Widgets } from 'blessed';
import chalk from 'chalk';
import figlet from 'figlet';

import { RemoteService } from '../services';
import { FIGLET_ROOM_HEADER } from '../typings';

@Workspace({
  friendlyName: 'Downstairs',
  menu: ['Downstairs'],
  name: 'downstairs',
})
export class DownstairsService {
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
