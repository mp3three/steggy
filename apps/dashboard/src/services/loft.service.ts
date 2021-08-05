import { EcobeeClimateStateDTO } from '@automagical/contracts/home-assistant';
import { Box, Button, LineChart } from '@automagical/contracts/terminal';
import { HomeAssistantFetchAPIService } from '@automagical/home-assistant';
import { RefreshAfter } from '@automagical/terminal';
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Widgets } from 'blessed';
import { Widgets as ContribWidgets } from 'blessed-contrib';
import chalk from 'chalk';
import dayjs from 'dayjs';
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
@LoadWorkspace(['Loft'])
export class LoftService implements Workspace {
  // #region Object Properties

  @WorkspaceElement()
  private BOX: Widgets.BoxElement;
  @WorkspaceElement()
  private HEADER: Widgets.BoxElement;
  @WorkspaceElement()
  private HUMIDITY: ContribWidgets.LineElement;
  @WorkspaceElement()
  private TEMPERATURE: ContribWidgets.LineElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    private readonly remoteService: RemoteService,
    private readonly fetchService: HomeAssistantFetchAPIService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public show(): void {
    this.getHistory();
  }

  // #endregion Public Methods

  // #region Protected Methods

  @RefreshAfter()
  protected async getHistory(): Promise<void> {
    const temps =
      await this.fetchService.fetchEntityHistory<EcobeeClimateStateDTO>(
        'climate.upstairs',
        dayjs().subtract(12, 'hour'),
        dayjs(),
      );
    let minTemperature = 1000;
    const temperatureData = [
      {
        title: 'Temps',
        x: temps.map((item) => dayjs(item.last_changed).format('HH:mm')),
        y: temps.map((item) => {
          if (item.attributes.current_temperature < minTemperature) {
            minTemperature = item.attributes.current_temperature;
          }
          return item.attributes.current_temperature;
        }),
      },
    ];
    this.TEMPERATURE.options.minY = minTemperature;
    this.TEMPERATURE.setData(temperatureData);
    let minHumidity = 1000;
    const humidityData = [
      {
        title: 'Temps',
        x: temps.map((item) => dayjs(item.last_changed).format('HH:mm')),
        y: temps.map((item) => {
          if (item.attributes.current_humidity < minHumidity) {
            minHumidity = item.attributes.current_humidity;
          }
          return item.attributes.current_humidity;
        }),
      },
    ];
    this.HUMIDITY.options.minY = minHumidity;
    this.HUMIDITY.setData(humidityData);
  }

  protected onApplicationBootstrap(): void {
    this.remoteService.room = 'loft';
    this.BOX = this.remoteService.BOX;
    this.BOX.border = {};
    this.HEADER = this.grid.set(0.5, 2.5, 2, 5, Box, {
      content: chalk.greenBright(
        figlet.textSync('Loft', {
          font: FIGLET_ROOM_HEADER,
        }),
      ),
      hidden: true,
    });
    this.HEADER.border = {};
    this.renderGraph();
  }

  // #endregion Protected Methods

  // #region Private Methods

  private renderGraph(): void {
    this.TEMPERATURE = this.grid.set(7, 2, 5, 4, LineChart, {
      label: 'Temperature',
      style: { baseline: 'red', line: 'cyan', text: 'white' },
    });
    this.HUMIDITY = this.grid.set(7, 6, 5, 4, LineChart, {
      label: 'Humidity',
      style: { baseline: 'blue', line: 'cyan', text: 'white' },
    });
  }

  // #endregion Private Methods
}
