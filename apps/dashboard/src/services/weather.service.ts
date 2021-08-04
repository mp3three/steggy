import { LATITUDE, LONGITUDE } from '@automagical/contracts/config';
import {
  Box,
  Button,
  FigletFonts,
  LCDDisplay,
} from '@automagical/contracts/terminal';
import { AutoConfigService, FetchService } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { Widgets } from 'blessed';
import { Widgets as ContribWidgets } from 'blessed-contrib';
import chalk from 'chalk';
import figlet from 'figlet';
import { Response } from 'node-fetch';

import { BLESSED_GRID, Workspace } from '../typings';
import { WorkspaceService } from './workspace.service';

@Injectable()
export class WeatherService implements Workspace {
  // #region Object Properties

  public readonly menuPosition = ['Weather'];

  public defaultActive = true;

  private BOX: Widgets.BoxElement;
  private DETAILS: Widgets.BoxElement;
  private DETAILS_BUTTON: Widgets.ButtonElement;
  private FORECAST: Widgets.BoxElement;
  private HEADER: Widgets.BoxElement;
  private MOON: Widgets.BoxElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: ContribWidgets.GridElement,
    private readonly workspaceService: WorkspaceService,
    private readonly fetchService: FetchService,
    private readonly configService: AutoConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  // @RefreshAfter()
  public toggleVisibility(): void {
    this.BOX.toggle();
    this.MOON.toggle();
    this.DETAILS?.hide();
    this.DETAILS_BUTTON?.toggle();
    this.FORECAST.toggle();
    this.HEADER.toggle();
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async onApplicationBootstrap(): Promise<void> {
    process.nextTick(async () => await this.render());
  }

  // #endregion Protected Methods

  // #region Private Methods

  private buildDetails(): void {
    this.DETAILS_BUTTON = Button({
      content: 'Detailed Report',
      left: 10,
      mouse: true,
      padding: {
        bottom: 0,
        left: 5,
        right: 5,
        top: 0,
      },
      shrink: true,
      style: {
        bg: 'white',
        fg: 'black',
      },
      top: 14,
    });
    this.DETAILS_BUTTON.on('press', async () => {
      if (!this.DETAILS) {
        this.DETAILS = this.grid.set(1, 3, 10, 7, Box, {
          draggable: true,
          hidden: true,
          label: chalk`{bgWhite.black Detailed weather report}`,
          mouse: true,
        });
        this.DETAILS.on('press', () => {
          console.log('HIT');
        });
      }
      this.DETAILS.show();
      this.DETAILS.setContent(chalk.magenta('Loading...'));
      this.DETAILS.setContent(await this.getWeatherDetails());
    });
    this.BOX.append(this.DETAILS_BUTTON);
  }

  private async getMoon(): Promise<string> {
    const response = await this.fetchService.fetch<Response>({
      process: false,
      rawUrl: true,
      url: `https://wttr.in/Moon?T`,
    });
    const text = (await response.text()).split(`\n`);
    return text.slice(0, -3).join(`\n`);
  }

  private async getWeatherDetails(): Promise<string> {
    const coords = [
      this.configService.get(LATITUDE),
      this.configService.get(LONGITUDE),
    ].join(',');
    const response = await this.fetchService.fetch<Response>({
      process: false,
      rawUrl: true,
      url: `https://wttr.in/${coords}?T&format=v2`,
    });
    const text = (await response.text()).split(`\n`);
    return text.join(`\n`);
    // return text.slice(7, -4).join(`\n`);
  }

  private async getWeatherReport(): Promise<string> {
    const coords = [
      this.configService.get(LATITUDE),
      this.configService.get(LONGITUDE),
    ].join(',');
    const response = await this.fetchService.fetch<Response>({
      process: false,
      rawUrl: true,
      url: `https://wttr.in/${coords}`,
    });
    const text = (await response.text()).split(`\n`);
    return text.slice(7, -4).join(`\n`);
  }

  private async render() {
    this.BOX = this.workspaceService.addSpace(Box, {}, this);
    this.BOX.border = {};
    this.HEADER = this.grid.set(0.5, 2.5, 2, 5, Box, {
      border: {},
      content: chalk.yellow(
        figlet.textSync('Weather', {
          font: 'Star Wars',
          // font: 'Univers',
        }),
      ),
    });
    this.HEADER.border = {};
    process.nextTick(async () => {
      this.MOON = this.grid.set(0.25, 7.75, 5, 2, Box, {
        content: await this.getMoon(),
      });
      this.MOON.border = {};
    });
    process.nextTick(async () => {
      this.FORECAST = this.grid.set(5, 2, 8, 8, Box, {
        align: 'center',
        content: await this.getWeatherReport(),
      } as Widgets.BoxOptions);
      this.FORECAST.border = {};
    });
    // this.buildDetails();
  }

  // #endregion Private Methods
}
