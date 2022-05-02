import { DeviceTriggerActivateDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Divider, Empty, Form, Input, Space, Tooltip } from 'antd';
import { dump, load } from 'js-yaml';

import { Link } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Same example Home Assistant docs use
const EXAMPLE_TRIGGER = {
  entity_id: 'binary_sensor.motion_occupancy',
  from: 'off',
  platform: 'state',
  to: 'on',
};

export function RoutineActivateDeviceTrigger(props: {
  activate: DeviceTriggerActivateDTO;
  onUpdate: (activate: Partial<DeviceTriggerActivateDTO>) => void;
}) {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item
        label={
          <Tooltip
            title={
              <Link
                to={{
                  pathname:
                    'https://www.home-assistant.io/docs/automation/trigger/',
                }}
                target="_blank"
              >
                Home Assistant Trigger Docs
              </Link>
            }
          >
            Trigger YAML
          </Tooltip>
        }
      >
        <Input.TextArea
          style={{ minHeight: '250px' }}
          defaultValue={props.activate?.trigger}
          onBlur={({ target }) => props.onUpdate({ trigger: target.value })}
          placeholder={dump(EXAMPLE_TRIGGER).trimEnd()}
        />
      </Form.Item>

      <Divider />
      <Form.Item label="Parsed">
        {is.empty(props.activate?.trigger) ? (
          <Empty />
        ) : (
          <SyntaxHighlighter language="yaml" style={atomDark}>
            {dump(load(props.activate?.trigger)).trimEnd()}
          </SyntaxHighlighter>
        )}
      </Form.Item>
    </Space>
  );
}
