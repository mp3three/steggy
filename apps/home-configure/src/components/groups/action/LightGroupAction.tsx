import { RoutineCommandGroupActionDTO } from '@automagical/controller-shared';
import { Form, Radio, Slider } from 'antd';
import React from 'react';

type tCommand = Omit<
  RoutineCommandGroupActionDTO<{ brightness: number }>,
  'group'
>;

export class LightGroupAction extends React.Component<{
  command: tCommand;
  onUpdate: (
    command: Partial<RoutineCommandGroupActionDTO<{ brightness: number }>>,
  ) => void;
}> {
  override componentDidMount(): void {
    this.setState({
      brightness: this.props.command?.extra?.brightness ?? 64,
      command: this.props.command?.command ?? 'dimUp',
    });
  }

  public getValue(): tCommand {
    return {
      command: this.props.command.command,
      extra: {
        brightness: this.props.command.extra.brightness,
      },
    };
  }

  override render() {
    return (
      <>
        <Form.Item label="Direction">
          <Radio.Group
            buttonStyle="solid"
            value={this.props.command.command}
            onChange={({ target }) =>
              this.props.onUpdate({
                command: target.value as string,
              })
            }
          >
            <Radio.Button value="dimUp">Up</Radio.Button>
            <Radio.Button value="dimDown">Down</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Amount">
          <Slider
            min={1}
            max={255}
            value={this.props.command?.extra?.brightness}
            onChange={brightness =>
              this.props.onUpdate({ extra: { brightness } })
            }
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
