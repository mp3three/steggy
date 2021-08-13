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
  friendlyName: 'Games',
  menu: ['Games'],
  name: 'games',
})
export class GamesService {
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
    this.remoteService.room = 'games';
    this.BOX = this.remoteService.BOX;
    this.BOX.border = {};
    this.HEADER = this.grid.set(0.5, 2.5, 2, 5, Box, {
      content: chalk.greenBright(
        figlet.textSync('Games', {
          font: FIGLET_ROOM_HEADER,
        }),
      ),
      hidden: true,
    });
    this.HEADER.border = {};
  }

  // #endregion Protected Methods
}
