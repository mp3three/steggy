import { Box } from '@automagical/contracts/terminal';
import { FetchService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Widgets } from 'blessed';
import { Response } from 'node-fetch';

import { Workspace } from '../typings';
import { WorkspaceService } from './workspace.service';

let id = 0;
@Injectable()
export class StonksService implements Workspace {
  // #region Object Properties

  public readonly menuPosition = ['Stonks'];

  private readonly id = id++;

  private BOX: Widgets.BoxElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly fetchService: FetchService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  // @RefreshAfter()
  public toggleVisibility(): void {
    this.BOX.toggle();
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async onApplicationBootstrap(): Promise<void> {
    this.BOX = this.workspaceService.addSpace(
      Box,
      {
        content: await this.getStonks(),
        hidden: true,
      },
      this,
    );
    this.BOX.border = {};
  }

  // #endregion Protected Methods

  // #region Private Methods

  private async getStonks(): Promise<string> {
    const response = await this.fetchService.fetch<Response>({
      headers: {
        'User-Agent': 'curl/7.64.0',
      },
      process: false,
      rawUrl: true,
      url: `https://stonks.icu/gme`,
    });
    return await response.text();
  }

  // #endregion Private Methods
}
