import { SolarActivateDTO } from '@text-based/controller-shared';
import { is } from '@text-based/utilities';
import { Form, Select } from 'antd';
import React from 'react';
import SolarCalc from 'solar-calc/types/solarCalc';

type tState = {
  event?: string;
  name: string;
};

export class RoutineActivateSolar extends React.Component<
  { activate?: SolarActivateDTO },
  tState
> {
  override state = {} as tState;

  override componentDidMount(): void {
    if (this.props.activate) {
      this.load(this.props.activate);
    }
  }

  public getValue(): SolarActivateDTO {
    if (is.empty(this.state.event)) {
      return undefined;
    }
    return { event: this.state.event as keyof SolarCalc };
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
          <Select.Option value={`astronomicalDawn`}>
            Astronomical Dawn
          </Select.Option>
          <Select.Option value={`nightEnd`}>Night End</Select.Option>
          <Select.Option value={`nauticalDawn`}>Nautical Dawn</Select.Option>
          <Select.Option value={`civilDawn`}>Civil Dawn</Select.Option>
          <Select.Option value={`dawn`}>Dawn</Select.Option>
          <Select.Option value={`sunrise`}>Sunrise</Select.Option>
          <Select.Option value={`sunriseEnd`}>Sunrise End</Select.Option>
          <Select.Option value={`solarNoon`}>Solar Noon</Select.Option>
          <Select.Option value={`sunsetStart`}>Sunset Start</Select.Option>
          <Select.Option value={`sunset`}>Sunset</Select.Option>
          <Select.Option value={`civilDusk`}>Civil Dusk</Select.Option>
          <Select.Option value={`dusk`}>Dusk</Select.Option>
          <Select.Option value={`nauticalDusk`}>Nautical Dusk</Select.Option>
          <Select.Option value={`astronomicalDusk`}>
            Astronomical Dusk
          </Select.Option>
          <Select.Option value={`nightStart`}>Night Start</Select.Option>
        </Select>
      </Form.Item>
    );
  }
}
