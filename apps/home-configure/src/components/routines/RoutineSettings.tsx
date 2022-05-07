import { ActivateCommand, RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Card,
  Checkbox,
  Descriptions,
  Divider,
  Input,
  Popover,
  Select,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { FD_ICONS, sendRequest } from '../../types';

export function RoutineSettings(props: {
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  const [description, setDescription] = useState('');

  async function update(body: Partial<RoutineDTO>): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      body,
      method: 'put',
      url: `/routine/${props.routine._id}`,
    });
    props.onUpdate(routine);
  }

  function updateDescription() {
    update({ description });
  }

  useEffect(() => {
    setDescription(props.routine.description);
  }, [props.routine.description, props.routine._id]);

  return (
    <Card type="inner">
      <Space direction="vertical" style={{ width: '100%' }}>
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
                    Body is optional, but may contain a json object to modify
                    the way the routine is processed for the individual call.
                  </Typography.Paragraph>
                  <Descriptions bordered>
                    <Descriptions.Item
                      span={1}
                      label={<Typography.Text code>force</Typography.Text>}
                    >
                      boolean
                    </Descriptions.Item>
                    <Descriptions.Item span={2}>
                      Pass <Typography.Text code>true</Typography.Text> to
                      ignore the repeat run restrictions of this routine, if
                      present.
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
                      Execute routine at timestamp, cannot be combined with
                      timeout.
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
        <Divider />
        <Checkbox
          checked={props.routine.sync}
          disabled={props.routine.command.some(({ type }) =>
            (['sleep', 'stop_processing'] as ActivateCommand[]).includes(type),
          )}
          onChange={({ target }) => update({ sync: target.checked })}
        >
          <Popover
            content={
              <Descriptions bordered>
                <Descriptions.Item span={3} label="When checked">
                  <Typography.Paragraph>
                    A command action must fully complete prior to the next
                    command running. This allows some commands, such as
                    <Typography.Text code>Stop Processing</Typography.Text>
                    to affect/prevent execution of following commands.
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    Entity state changes require a confirmation from Home
                    Assistant, which may not always be instant.
                  </Typography.Paragraph>
                </Descriptions.Item>
                <Descriptions.Item span={3} label="When unchecked">
                  Actions will be initiated at the simultaniously, having no
                  influence each other. Entity state changes are performed in a
                  "fire and forget" manner.
                </Descriptions.Item>
              </Descriptions>
            }
          >
            {`Synchronous command processing `}
            {FD_ICONS.get('information')}
          </Popover>
        </Checkbox>
        <Divider orientation="left">
          <Tooltip
            title={
              <Typography>
                {
                  'Manual activation via api call may ignore this setting by adding including '
                }
                <Typography.Text code>force: true</Typography.Text>
                {' option'}
              </Typography>
            }
          >
            {FD_ICONS.get('information')}
            {` Repeat Runs`}
          </Tooltip>
        </Divider>
        <Select
          style={{ width: '250px' }}
          disabled={!props.routine.sync}
          value={props.routine.repeat ?? 'normal'}
          onChange={repeat => update({ repeat })}
        >
          <Select.Option value="normal">Normal</Select.Option>
          <Select.Option value="queue">Queue</Select.Option>
          <Select.Option value="block">Block until complete</Select.Option>
          <Select.Option value="interrupt">Interrupt</Select.Option>
        </Select>
        {!props.routine.sync ? (
          <Typography.Paragraph type="secondary">
            Setting only used with sync routines.
          </Typography.Paragraph>
        ) : (
          <Typography.Paragraph type="secondary">
            {/* Shh... it's secretly a switch statement in disguise */}
            {is.empty(props.routine.repeat) || props.routine.repeat === 'normal'
              ? 'This routine will not automatically interact with itself.'
              : undefined}
            {props.routine.repeat === 'queue'
              ? 'Repeat runs of this routine will queue and execute in order. First in first out.'
              : undefined}
            {props.routine.repeat === 'block'
              ? 'Repeat runs of this routine will be blocked until the first one is complete.'
              : undefined}
            {props.routine.repeat === 'interrupt'
              ? 'Repeat runs of this routine will also attempt to interrupt previous runs, stopping new commands from being run.'
              : undefined}
          </Typography.Paragraph>
        )}
        <Divider orientation="left">Description</Divider>
        <Input.TextArea
          value={description}
          placeholder="Long form text description for personal use."
          onChange={({ target }) => setDescription(target.value)}
          onBlur={() => updateDescription()}
          style={{ minHeight: '150px' }}
        />
      </Space>
    </Card>
  );
}
