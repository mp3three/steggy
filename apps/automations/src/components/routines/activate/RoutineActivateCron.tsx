import { ScheduleActivateDTO } from '@text-based/controller-shared';
import { CronExpression, is, TitleCase } from '@text-based/utilities';
import { Divider, Form, Input, Select, Space } from 'antd';
import React from 'react';

type tState = {
  name: string;
  schedule?: string;
};

export class RoutineActivateCron extends React.Component<
  { activate?: ScheduleActivateDTO },
  tState
> {
  override state = {} as tState;
  private input: Input;

  override componentDidMount(): void {
    if (this.props.activate) {
      this.load(this.props.activate);
    }
  }

  public getValue(): ScheduleActivateDTO {
    if (is.empty(this.state.schedule)) {
      return undefined;
    }
    return { schedule: this.state.schedule };
  }

  public load({ schedule }: ScheduleActivateDTO): void {
    this.setState({ schedule });
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select
          showSearch
          placeholder="Preconfigured schedules"
          style={{ width: '100%' }}
          onChange={this.preconfigured.bind(this)}
          filterOption={(input, option) =>
            option.children
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {Object.keys(CronExpression).map(key => (
            <Select.Option key={key} value={CronExpression[key]}>
              {TitleCase(key.toLowerCase(), false)}
            </Select.Option>
          ))}
        </Select>
        <Divider />
        <Form.Item label="Cron Schedule">
          <Input
            ref={i => (this.input = i)}
            value={this.state.schedule}
            onChange={this.updateValue.bind(this)}
          />
        </Form.Item>
      </Space>
    );
  }

  private preconfigured(schedule: string): void {
    this.setState({ schedule });
  }

  private updateValue({ target }: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ schedule: target.value });
  }
}
