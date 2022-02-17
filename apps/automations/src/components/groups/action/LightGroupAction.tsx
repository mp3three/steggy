import { RoutineCommandGroupActionDTO } from '@text-based/controller-shared';
import { Form, Radio, Slider } from 'antd';
import React from 'react';

type tState = {
  brightness: number;
  command: string;
};

type t = Omit<RoutineCommandGroupActionDTO<{ brightness: number }>, 'group'>;

export class LightGroupAction extends React.Component<{ command: t }, tState> {
  override state = {} as tState;

  override componentDidMount(): void {
    this.setState({
      brightness: this.props.command?.extra?.brightness ?? 64,
      command: this.props.command?.command ?? 'dimUp',
    });
  }

  public getValue(): t {
    return {
      command: this.state.command,
      extra: {
        brightness: this.state.brightness,
      },
    };
  }

  override render() {
    return (
      <>
        <Form.Item label="Direction">
          <Radio.Group
            value={this.state.command}
            onChange={({ target }) => this.setState({ command: target.value })}
          >
            <Radio.Button value="dimUp">Up</Radio.Button>
            <Radio.Button value="dimDown">Down</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Amount">
          <Slider
            min={1}
            max={255}
            value={this.state.brightness}
            onChange={brightness => this.setState({ brightness })}
            marks={{
              1: 'min',
              128: '1/2',
              170: '2/3',
              192: '3/4',
              255: 'max',
              64: '1/4',
              85: '1/3',
            }}
          />
        </Form.Item>
      </>
    );
  }
}
