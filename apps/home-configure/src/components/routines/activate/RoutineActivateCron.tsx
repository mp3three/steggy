import { ScheduleActivateDTO } from '@automagical/controller-shared';
import { CronExpression, TitleCase } from '@automagical/utilities';
import { Divider, Form, Input, Select, Space } from 'antd';
import React from 'react';

export class RoutineActivateCron extends React.Component<{
  activate: ScheduleActivateDTO;
  onUpdate: (activate: Partial<ScheduleActivateDTO>) => void;
}> {
  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select
          showSearch
          placeholder="Preconfigured schedules"
          style={{ width: '100%' }}
          value={this.props.activate?.schedule}
          onChange={schedule => this.props.onUpdate({ schedule })}
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
            value={this.props.activate?.schedule}
            onChange={({ target }) =>
              this.props.onUpdate({ schedule: target.value })
            }
          />
        </Form.Item>
      </Space>
    );
  }
}
