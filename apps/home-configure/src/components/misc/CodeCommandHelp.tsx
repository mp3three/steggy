import { Descriptions, Popover, Space, Typography } from 'antd';

import { FD_ICONS } from '../../types';

export function CodeCommandHelp() {
  return (
    <Popover
      content={
        <Space direction="vertical" style={{ maxWidth: '45vw' }}>
          <Typography.Title level={5}>Injected Variables</Typography.Title>
          <Descriptions bordered>
            <Descriptions.Item
              span={3}
              label={<Typography.Text code>home_assistant</Typography.Text>}
            >
              Object containing all entities reported by home assistant, and
              their current state.
            </Descriptions.Item>
            <Descriptions.Item
              span={3}
              label={<Typography.Text code>steggy</Typography.Text>}
            >
              API to issue commands directly to internal providers
            </Descriptions.Item>
            <Descriptions.Item
              span={3}
              label={<Typography.Text code>stop_processing</Typography.Text>}
            >
              Prevent the routine runner from advancing to the next routine.
              Only applies to routines operating synchronously.
            </Descriptions.Item>
            <Descriptions.Item
              span={3}
              label={
                <Typography.Text code>{`(room | person).name`}</Typography.Text>
              }
            >
              Object named after the room or person, which is contains all the
              associated metadata. Is only defined if there are metadata
              properties to look up.
            </Descriptions.Item>
          </Descriptions>
        </Space>
      }
    >
      {FD_ICONS.get('information')}
    </Popover>
  );
}
