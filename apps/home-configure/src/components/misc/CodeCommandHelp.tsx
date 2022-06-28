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
            <Descriptions.Item
              span={3}
              label={<Typography.Text code>call_service</Typography.Text>}
            >
              Call a service for a domain in Home Assistant. All capabilites +
              intellisense information provided by your personal Home Assistant
              install.
            </Descriptions.Item>
            <Descriptions.Item
              span={3}
              label={<Typography.Text code>cacheManager</Typography.Text>}
            >
              <Typography.Paragraph>
                Directly interact with the server cache. Store arbitrary data
                for later usage.
              </Typography.Paragraph>
              <Typography.Text type="secondary">
                Note: Specific operation depends on server configuration.
                Intended for short term (minutes to days) storage of data. Use
                room / person metadata for long term storage
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>
        </Space>
      }
    >
      {FD_ICONS.get('information')}
    </Popover>
  );
}
