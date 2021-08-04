import { Box } from '@automagical/contracts/terminal';
import { FetchService, SliceLines } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { Widgets } from 'blessed';
import { Widgets as ContribWidgets } from 'blessed-contrib';
import chalk from 'chalk';
import figlet from 'figlet';

import { LoadWorkspace, WorkspaceElement } from '../decorators';
import { BLESSED_GRID, Workspace } from '../typings';

@Injectable()
@LoadWorkspace()
export class StonksService implements Workspace {
  // #region Object Properties

  public readonly menuPosition = ['Stonks'];

  @WorkspaceElement()
  private BOX: Widgets.BoxElement;
  @WorkspaceElement()
  private HEADER: Widgets.BoxElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: ContribWidgets.GridElement,
    private readonly fetchService: FetchService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public show(): void {
    this.reload();
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async onApplicationBootstrap(): Promise<void> {
    try {
      this.BOX = this.grid.set(0, 2, 12, 8, Box, {
        align: 'center',
        hidden: true,
        padding: {
          bottom: 10,
        },
        valign: 'bottom',
      });
      this.BOX.border = {};

      this.HEADER = this.grid.set(0.5, 2.5, 2, 5, Box, {
        border: {},
        content: chalk.yellow(
          figlet.textSync('Stonks', {
            font: 'Star Wars',
            // font: 'Univers',
          }),
        ),
        hidden: true,
      });
      this.HEADER.border = {};
    } catch (error) {
      console.error(error);
    }
  }

  // #endregion Protected Methods

  // #region Private Methods

  @SliceLines(0, -4)
  private async getStonks(): Promise<string> {
    return await this.fetchService.fetch<string>({
      headers: {
        'User-Agent': 'curl/7.64.0',
      },
      process: 'text',
      rawUrl: true,
      url: `https://stonks.icu/gme/amd`,
    });
  }

  private reload(): void {
    process.nextTick(async () => {
      this.BOX.setContent(chalk`{magenta Loading...}`);
      this.BOX.setContent(await this.getStonks());
    });
  }

  // #endregion Private Methods
}
