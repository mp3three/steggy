import {
  BLESSED_GRID,
  Box,
  BoxElement,
  GridElement,
  iWorkspace,
} from '@automagical/terminal';
import {
  FontAwesomeIcons,
  Workspace,
  WorkspaceElement,
} from '@automagical/terminal';
import { FetchService, SliceLines } from '@automagical/utilities';
import { Inject } from '@nestjs/common';
import chalk from 'chalk';
import figlet from 'figlet';

import { HOME_MENU } from '../typings';

@Workspace({
  customHeader: true,
  friendlyName: 'Stonks',
  menu: [HOME_MENU, chalk` ${FontAwesomeIcons.line_chart}  {bold Stonks}`],
  name: 'stonks',
  roomRemote: true,
})
export class StonksWorkspace implements iWorkspace {
  

  @WorkspaceElement()
  private BOX: BoxElement;
  @WorkspaceElement()
  private HEADER: BoxElement;

  

  

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    private readonly fetchService: FetchService,
  ) {}

  

  

  public async onShow(): Promise<void> {
    this.BOX.setContent(chalk`{magenta Loading...}`);
    this.BOX.setContent(await this.getStonks());
  }

  

  

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

  
}
