import { ScheduleActivateDTO } from '@steggy/controller-shared';
import { CronExpression, TitleCase } from '@steggy/utilities';
import { Divider, Form, Input, Select, Space } from 'antd';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
export class RoutineActivateCron extends React.Component<{
  activate: ScheduleActivateDTO;
  onUpdate: (activate: Partial<ScheduleActivateDTO>) => void;
}> {
  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Preformatted">
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
        </Form.Item>
        <Divider />
        <Form.Item label=" " colon={false}>
          <SyntaxHighlighter language="yaml" style={atomDark}>
            {`┌────────────── second (optional)
│ ┌──────────── minute
│ │ ┌────────── hour
│ │ │ ┌──────── day of month
│ │ │ │ ┌────── month
│ │ │ │ │ ┌──── day of week
│ │ │ │ │ │
│ │ │ │ │ │
* * * * * *`}
          </SyntaxHighlighter>
        </Form.Item>
        <Form.Item label="Manual">
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
