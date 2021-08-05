import { Box } from '@automagical/contracts/terminal';
import { Inject, Injectable } from '@nestjs/common';
import { Widgets } from 'blessed';
import chalk from 'chalk';
import figlet from 'figlet';

import { LoadWorkspace, WorkspaceElement } from '../decorators';
import {
  BLESSED_GRID,
  FIGLET_ROOM_HEADER,
  GridElement,
  Workspace,
} from '../typings';
import { RemoteService } from './remote.service';

@Injectable()
@LoadWorkspace(['Bedroom'])
export class BedroomService implements Workspace {
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
