import { ScheduleActivateDTO } from '@steggy/controller-shared';
import { CronExpression, TitleCase } from '@steggy/utilities';
import { Divider, Form, Input, Select, Space } from 'antd';
import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { CRON_MESSAGE } from '../../../types';

export function RoutineActivateCron(props: {
  activate: ScheduleActivateDTO;
  onUpdate: (activate: Partial<ScheduleActivateDTO>) => void;
}) {
  const [schedule, setSchedule] = useState<string>('');
  useEffect(() => {
    setSchedule(props.activate?.schedule);
  }, [props.activate?.schedule]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item label="Preformatted">
        <Select
          showSearch
          placeholder="Preconfigured schedules"
          onChange={value => setSchedule(value)}
          style={{ width: '100%' }}
          value={schedule}
          onBlur={() => props.onUpdate({ schedule })}
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
          {CRON_MESSAGE}
        </SyntaxHighlighter>
      </Form.Item>
      <Form.Item label="Manual">
        <Input
          value={schedule}
          onChange={({ target }) => setSchedule(target.value)}
          onBlur={() => props.onUpdate({ schedule })}
        />
      </Form.Item>
    </Space>
  );
}
