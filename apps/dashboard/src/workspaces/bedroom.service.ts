import {
  BLESSED_GRID,
  Box,
  BoxElement,
  GridElement,
  iWorkspace,
} from '@automagical/contracts/terminal';
import { Workspace, WorkspaceElement } from '@automagical/terminal';
import { Inject } from '@nestjs/common';
import chalk from 'chalk';
import figlet from 'figlet';

import { RemoteService } from '../services';
import { FIGLET_ROOM_HEADER } from '../typings';

@Workspace({
  friendlyName: 'Master Bedroom',
  menu: ['Bedroom'],
  name: 'bedroom',
})
export class BedroomService {
  // #region Object Properties

  @WorkspaceElement()
  private BOX: BoxElement;
  @WorkspaceElement()
  private HEADER: BoxElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    private readonly remoteService: RemoteService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onApplicationBootstrap(): void {
    this.remoteService.room = 'master';
    this.BOX = this.remoteService.BOX;
    this.BOX.border = {};
    this.HEADER = this.grid.set(0.5, 2.5, 2, 5, Box, {
      content: chalk.greenBright(
        figlet.textSync('Bedroom', {
          font: FIGLET_ROOM_HEADER,
        }),
      ),
      hidden: true,
    });
    this.HEADER.border = {};
  }

  // #endregion Protected Methods
}
