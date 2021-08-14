import { LATITUDE, LONGITUDE } from '@automagical/contracts/config';
import { BLESSED_GRID, Box, iWorkspace } from '@automagical/contracts/terminal';
import {
  WeatherIcons,
  Workspace,
  WorkspaceElement,
} from '@automagical/terminal';
import {
  AutoConfigService,
  FetchService,
  SliceLines,
} from '@automagical/utilities';
import { Inject } from '@nestjs/common';
import { Widgets } from 'blessed';
import { Widgets as ContribWidgets } from 'blessed-contrib';
import chalk from 'chalk';

@Workspace({
  friendlyName: 'Weather',
  menu: [` ${WeatherIcons.day_cloudy_high}  Weather`],
  name: 'weather',
})
export class WeatherService implements iWorkspace {
  // #region Object Properties

  public readonly menuPosition = ['Weather'];

  public defaultActive = true;

  @WorkspaceElement()
  private FORECAST: Widgets.BoxElement;
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

  public async onShow(): Promise<void> {
    const LOADING = chalk.magenta(`Loading`);
    this.MOON.setContent(LOADING);
    this.FORECAST.setContent(LOADING);
    this.MOON.setContent(await this.getMoon());
    this.FORECAST.setContent(await this.getWeatherReport());
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
    process.nextTick(async () => {
      this.MOON = this.grid.set(0.25, 7.75, 5, 2, Box, {
        hidden: true,
      });
      this.MOON.border = {};
    });
    process.nextTick(async () => {
      this.FORECAST = this.grid.set(5, 2, 8, 8, Box, {
        align: 'center',
        hidden: true,
      } as Widgets.BoxOptions);
      this.FORECAST.border = {};
    });
  }

  // #endregion Private Methods
}
