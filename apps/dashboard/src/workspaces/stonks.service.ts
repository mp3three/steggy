import { BLESSED_GRID, Box, iWorkspace } from '@automagical/contracts/terminal';
import { Workspace, WorkspaceElement } from '@automagical/terminal';
import { FetchService, SliceLines } from '@automagical/utilities';
import { Inject } from '@nestjs/common';
import { Widgets } from 'blessed';
import { Widgets as ContribWidgets } from 'blessed-contrib';
import chalk from 'chalk';
import figlet from 'figlet';

@Workspace({
  friendlyName: 'Stonks',
  menu: ['Stonks'],
  name: 'stonks',
})
export class StonksService implements iWorkspace {
  // #region Object Properties

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

  public async onShow(): Promise<void> {
    this.BOX.setContent(chalk`{magenta Loading...}`);
    this.BOX.setContent(await this.getStonks());
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

  // #endregion Private Methods
}
