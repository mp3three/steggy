import { RoutineDTO } from '@steggy/controller-shared';
import { Descriptions, Popover, Space, Typography } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { FD_ICONS, sendRequest } from '../../../types';

export function SettingsHeader(props: { routine: RoutineDTO }) {
  return (
    <Descriptions bordered>
      <Descriptions.Item span={3} label="Routine Identifier">
        <Typography.Text code>{props.routine._id}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item span={3} label="API Activate">
        <Popover
          placement="left"
          title={<Typography.Title level={4}>POSTDATA</Typography.Title>}
          content={
            <Space direction="vertical">
              <Typography.Paragraph>
                Body is optional, but may contain a json object to modify the
                way the routine is processed for the individual call.
              </Typography.Paragraph>
              <Descriptions bordered>
                <Descriptions.Item
                  span={1}
                  label={<Typography.Text code>force</Typography.Text>}
                >
                  boolean
                </Descriptions.Item>
                <Descriptions.Item span={2}>
                  Pass <Typography.Text code>true</Typography.Text> to ignore
                  the repeat run restrictions of this routine, if present.
                </Descriptions.Item>
                <Descriptions.Item
                  span={1}
                  label={<Typography.Text code>timeout</Typography.Text>}
                >
                  number
                </Descriptions.Item>
                <Descriptions.Item span={2}>
                  Delay ms before executing routine.
                </Descriptions.Item>
                <Descriptions.Item
                  span={1}
                  label={<Typography.Text code>timestamp</Typography.Text>}
                >
                  parsable date string
                </Descriptions.Item>
                <Descriptions.Item span={2}>
                  Execute routine at timestamp, cannot be combined with timeout.
                </Descriptions.Item>
                <Descriptions.Item
                  span={1}
                  label={<Typography.Text code>source</Typography.Text>}
                >
                  string
                </Descriptions.Item>
                <Descriptions.Item span={2}>
                  Explicitly set the activation source for the routine.
                </Descriptions.Item>
                <Descriptions.Item span={3} label="Example">
                  <SyntaxHighlighter language="yaml" style={atomDark}>
                    {JSON.stringify(
                      {
                        force: false,
                        source: 'Special activation with extra description',
                        timestamp: '2022-04-25T16:24:40.685Z',
                      },
                      undefined,
                      '  ',
                    )}
                  </SyntaxHighlighter>
                </Descriptions.Item>
              </Descriptions>
            </Space>
          }
        >
          {FD_ICONS.get('information')}
          <Typography.Text strong> POST </Typography.Text>
          <Typography.Text code>
            {sendRequest.url(`/routine/${props?.routine?._id}`)}
          </Typography.Text>
        </Popover>
      </Descriptions.Item>
    </Descriptions>
  );
}
