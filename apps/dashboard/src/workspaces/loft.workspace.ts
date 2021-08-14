import { EcobeeClimateStateDTO } from '@automagical/contracts/home-assistant';
import {
  BLESSED_GRID,
  GridElement,
  iWorkspace,
  LineChart,
  LineElement,
} from '@automagical/contracts/terminal';
import { HomeAssistantFetchAPIService } from '@automagical/home-assistant';
import {
  MDIIcons,
  RefreshAfter,
  Workspace,
  WorkspaceElement,
} from '@automagical/terminal';
import { Inject } from '@nestjs/common';
import dayjs from 'dayjs';

@Workspace({
  defaultWorkspace: true,
  friendlyName: 'Loft',
  menu: [` ${MDIIcons.desktop_mac}  Loft`],
  name: 'loft',
  roomRemote: true,
})
export class LoftWorkspace implements iWorkspace {
  // #region Object Properties

  @WorkspaceElement()
  private HUMIDITY: LineElement;
  @WorkspaceElement()
  private TEMPERATURE: LineElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    private readonly fetchService: HomeAssistantFetchAPIService,
  ) {
    setInterval(() => {
      return this;
    }, 1000);
  }

  // #endregion Constructors

  // #region Public Methods

  public onShow(): void {
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
