import { SolarActivateDTO } from '@automagical/controller-shared';
import { DOWN, is, UP } from '@automagical/utilities';
import { Form, Select } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type SolarCalcType from 'solar-calc/types/solarCalc';

import { sendRequest } from '../../../types';

type tState = {
  astronomicalDawn?: string;
  astronomicalDusk?: string;
  civilDawn?: string;
  civilDusk?: string;
  dawn?: string;
  dusk?: string;
  event?: string;
  goldenHourEnd?: string;
  goldenHourStart?: string;
  name: string;
  nauticalDawn?: string;
  nauticalDusk?: string;
  nightEnd?: string;
  nightStart?: string;
  solarNoon?: string;
  sunrise?: string;
  sunriseEnd?: string;
  sunset?: string;
  sunsetStart?: string;
};
const LABELS = new Map([
  ['astronomicalDawn', 'Astronomical Dawn'],
  ['astronomicalDusk', 'Astronomical Dusk'],
  ['civilDawn', 'Civil Dawn'],
  ['civilDusk', 'Civil Dusk'],
  ['dawn', 'Dawn'],
  ['dusk', 'Dusk'],
  ['nauticalDawn', 'Nautical Dawn'],
  ['nauticalDusk', 'Nautical Dusk'],
  ['nightEnd', 'Night End'],
  ['nightStart', 'Night Start'],
  ['solarNoon', 'Solar Noon'],
  ['sunrise', 'Sunrise'],
  ['sunriseEnd', 'Sunrise End'],
  ['sunset', 'Sunset'],
  ['sunsetStart', 'Sunset Start'],
]);

export class RoutineActivateSolar extends React.Component<
  { activate?: SolarActivateDTO },
  tState
> {
  override state = {} as tState;

  override async componentDidMount(): Promise<void> {
    if (this.props.activate) {
      this.load(this.props.activate);
    }
    await this.refresh();
  }

  public getValue(): SolarActivateDTO {
    if (is.empty(this.state.event)) {
      return undefined;
    }
    return { event: this.state.event as keyof SolarCalcType };
  }

  public load({ event }: SolarActivateDTO): void {
    this.setState({ event });
  }

  override render() {
    return (
      <Form.Item label="Solar Event">
        <Select
          style={{ width: '100%' }}
          value={this.state.event}
          onChange={event => this.setState({ event })}
        >
          {[
            'astronomicalDawn',
            'astronomicalDusk',
            'civilDawn',
            'civilDusk',
            'dawn',
            'dusk',
            'nauticalDawn',
            'nauticalDusk',
            'nightEnd',
            'nightStart',
            'solarNoon',
            'sunrise',
            'sunriseEnd',
            'sunset',
            'sunsetStart',
          ]
            .map(event => [event, dayjs(this.state[event])])
            .sort(
              ([, a]: [string, dayjs.Dayjs], [, b]: [string, dayjs.Dayjs]) =>
                a.isAfter(b) ? UP : DOWN,
            )
            .map(([eventName, day]: [string, dayjs.Dayjs]) => (
              <Select.Option key={eventName} value={eventName}>
                {LABELS.get(eventName)} {day.format('hh:mm:ss A')}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
    );
  }

  private async refresh(): Promise<void> {
    this.setState({
      ...(await sendRequest<tState>({
        url: `/debug/solar`,
      })),
    });
  }
}
