import { LATITUDE, LONGITUDE } from '@automagical/contracts/config';
import { Box } from '@automagical/contracts/terminal';
import {
  AutoConfigService,
  FetchService,
  SliceLines,
} from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { Widgets } from 'blessed';
import { Widgets as ContribWidgets } from 'blessed-contrib';
import chalk from 'chalk';
import figlet from 'figlet';

import { LoadWorkspace, WorkspaceElement } from '../decorators';
import { BLESSED_GRID, Workspace } from '../typings';

@Injectable()
@LoadWorkspace()
export class WeatherService implements Workspace {
  // #region Object Properties

  public readonly menuPosition = ['Weather'];

  public defaultActive = true;

  @WorkspaceElement()
  private FORECAST: Widgets.BoxElement;
  @WorkspaceElement()
  private HEADER: Widgets.BoxElement;
  @WorkspaceElement()
  private MOON: Widgets.BoxElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: ContribWidgets.GridElement,
    private readonly fetchService: FetchService,
    private readonly configService: AutoConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public show(): void {
    //
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async onApplicationBootstrap(): Promise<void> {
    process.nextTick(async () => await this.render());
  }

  // #endregion Protected Methods

  // #region Private Methods

  @SliceLines(0, -3)
  private async getMoon(): Promise<string> {
    return await this.fetchService.fetch<string>({
      process: 'text',
      rawUrl: true,
      url: `https://wttr.in/Moon?T`,
    });
  }

  @SliceLines(7, -4)
  private async getWeatherReport(): Promise<string> {
    return await this.fetchService.fetch<string>({
      process: 'text',
      rawUrl: true,
      url: `https://wttr.in/${[
        this.configService.get(LATITUDE),
        this.configService.get(LONGITUDE),
      ].join(',')}`,
    });
  }

  private async render() {
    this.HEADER = this.grid.set(0.5, 2.5, 2, 5, Box, {
      border: {},
      content: chalk.yellow(
        figlet.textSync('Weather', {
          font: 'Star Wars',
          // font: 'Univers',
        }),
      ),
      hidden: true,
    });
    this.HEADER.border = {};
    process.nextTick(async () => {
      this.MOON = this.grid.set(0.25, 7.75, 5, 2, Box, {
        content: await this.getMoon(),
        hidden: true,
      });
      this.MOON.border = {};
    });
    process.nextTick(async () => {
      this.FORECAST = this.grid.set(5, 2, 8, 8, Box, {
        align: 'center',
        content: await this.getWeatherReport(),
        hidden: true,
      } as Widgets.BoxOptions);
      this.FORECAST.border = {};
    });
  }

  // #endregion Private Methods
}
