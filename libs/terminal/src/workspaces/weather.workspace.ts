import {
  BLESSED_GRID,
  Box,
  BoxElement,
  BoxOptions,
  GridElement,
  iWorkspace,
} from '@automagical/contracts/terminal';
import {
  AutoConfigService,
  FetchService,
  LATITUDE,
  LONGITUDE,
  SliceLines,
} from '@automagical/utilities';
import { Inject } from '@nestjs/common';
import chalk from 'chalk';

import { Workspace } from '../decorators/workspace.decorator';
import { WorkspaceElement } from '../decorators/workspace-element.decorator';
import { WeatherIcons } from '../icons/weather-icons';

@Workspace({
  friendlyName: 'Weather',
  menu: [chalk` ${WeatherIcons.day_cloudy_high}  {bold Weather}`],
  name: 'weather',
})
export class WeatherWorkspace implements iWorkspace {
  public readonly menuPosition = ['Weather'];

  public defaultActive = true;

  @WorkspaceElement()
  private FORECAST: BoxElement;
  @WorkspaceElement()
  private MOON: BoxElement;

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    private readonly fetchService: FetchService,
    private readonly configService: AutoConfigService,
  ) {}

  public async onShow(): Promise<void> {
    const LOADING = chalk.magenta(`Loading`);
    this.MOON.setContent(LOADING);
    this.FORECAST.setContent(LOADING);
    this.MOON.setContent(await this.getMoon());
    this.FORECAST.setContent(await this.getWeatherReport());
  }

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
      this.MOON = this.grid.set(0.25, 7.25, 5, 2.5, Box, {
        hidden: true,
      });
      this.MOON.border = {};
    });
    process.nextTick(async () => {
      this.FORECAST = this.grid.set(5, 2, 8, 8, Box, {
        align: 'center',
        hidden: true,
      } as BoxOptions);
      this.FORECAST.border = {};
    });
  }
}
