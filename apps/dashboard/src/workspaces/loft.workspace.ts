import { EcobeeClimateStateDTO } from '@automagical/home-assistant';
import {
  BLESSED_GRID,
  GridElement,
  iWorkspace,
  LineChart,
  LineElement,
} from '@automagical/terminal';
import { HomeAssistantFetchAPIService } from '@automagical/home-assistant';
import {
  MDIIcons,
  RefreshAfter,
  Workspace,
  WorkspaceElement,
} from '@automagical/terminal';
import { Inject } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';

import { HOME_MENU } from '../typings';

@Workspace({
  friendlyName: 'Loft',
  menu: [HOME_MENU, chalk` ${MDIIcons.desktop_mac}  {bold Loft}`],
  name: 'loft',
  roomRemote: true,
})
export class LoftWorkspace implements iWorkspace {
  

  @WorkspaceElement()
  private HUMIDITY: LineElement;
  @WorkspaceElement()
  private TEMPERATURE: LineElement;

  

  

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    private readonly fetchService: HomeAssistantFetchAPIService,
  ) {}

  

  

  public onShow(): void {
    this.getHistory();
  }

  

  

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
    this.TEMPERATURE = this.grid.set(7, 2, 5, 4, LineChart, {
      hidden: true,
      label: 'Temperature',
      style: { baseline: 'red', line: 'cyan', text: 'white' },
    });
    this.HUMIDITY = this.grid.set(7, 6, 5, 4, LineChart, {
      hidden: true,
      label: 'Humidity',
      style: { baseline: 'blue', line: 'cyan', text: 'white' },
    });
  }

  
}
