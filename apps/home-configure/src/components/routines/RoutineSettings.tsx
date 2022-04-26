import { ActivateCommand, RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Card,
  Checkbox,
  Descriptions,
  Divider,
  Popover,
  Select,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { FD_ICONS, sendRequest } from '../../types';

export class RoutineSettings extends React.Component<{
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}> {
  override render() {
    return (
      <Card type="inner">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Paragraph>
            <Typography.Title level={5}>Routine Identifier</Typography.Title>
            <Typography.Text code>{this.props.routine._id}</Typography.Text>
            <Typography.Title level={5}>API Activate</Typography.Title>
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
                      label={
                        <Typography.Text code>bypassRepeat</Typography.Text>
                      }
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
                            bypassRepeat: false,
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
              <Typography.Text strong>POST </Typography.Text>
              <Typography.Text code>
                {sendRequest.url(`/routine/${this.props?.routine?._id}`)}
              </Typography.Text>
            </Popover>
          </Typography.Paragraph>
          <Divider />
          <Checkbox
            checked={this.props.routine.sync}
            disabled={this.props.routine.command.some(({ type }) =>
              (['sleep', 'stop_processing'] as ActivateCommand[]).includes(
                type,
              ),
            )}
            onChange={({ target }) => this.update({ sync: target.checked })}
          >
            {`Synchronous command processing `}
            <Tooltip
              title={
                <Typography>
                  <Typography.Paragraph>
                    When checked, a command action must fully complete prior to
                    the next command running. This allows some commands, such as
                    <Typography.Text code>Stop Processing</Typography.Text>
                    to affect/prevent execution of following commands. Entity
                    state changes require a confirmation from Home Assistant,
                    which may be affected by real world conditions.
                  </Typography.Paragraph>
                  <Divider />
                  <Typography.Paragraph>
                    While unchecked, actions will be initiated at the
                    simultaniously, having no influence each other. Entity state
                    changes are performed in a "fire and forget" manner.
                  </Typography.Paragraph>
                </Typography>
              }
            >
              {FD_ICONS.get('information')}
            </Tooltip>
          </Checkbox>
          <Divider orientation="left">
            <Tooltip
              title={
                <Typography>
                  {
                    'Manual activation via api call may ignore this setting by adding including '
                  }
                  <Typography.Text code>bypassRepeat: true</Typography.Text>
                  {' option'}
                </Typography>
              }
            >
              {FD_ICONS.get('information')}
            </Tooltip>
            {` Repeat Runs`}
          </Divider>
          <Select
            style={{ width: '250px' }}
            disabled={!this.props.routine.sync}
            value={this.props.routine.repeat ?? 'normal'}
            onChange={repeat => this.update({ repeat })}
          >
            <Select.Option value="normal">Normal</Select.Option>
            <Select.Option value="queue">Queue</Select.Option>
            <Select.Option value="block">Block until complete</Select.Option>
            <Select.Option value="interrupt">Interrupt</Select.Option>
          </Select>
          {!this.props.routine.sync ? (
            <Typography.Paragraph type="secondary">
              Setting only used with sync routines.
            </Typography.Paragraph>
          ) : (
            <Typography.Paragraph type="secondary">
              {/* Shh... it's secretly a switch statement in disguise */}
              {is.empty(this.props.routine.repeat) ||
              this.props.routine.repeat === 'normal'
                ? 'This routine will not automatically interact with itself.'
                : undefined}
              {this.props.routine.repeat === 'queue'
                ? 'Repeat runs of this routine will queue and execute in order. First in first out.'
                : undefined}
              {this.props.routine.repeat === 'block'
                ? 'Repeat runs of this routine will be blocked until the first one is complete.'
                : undefined}
              {this.props.routine.repeat === 'interrupt'
                ? 'Repeat runs of this routine will also attempt to interrupt previous runs, stopping new commands from being run.'
                : undefined}
            </Typography.Paragraph>
          )}
        </Space>
      </Card>
    );
  }

  private async update(body: Partial<RoutineDTO>): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      body,
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(routine);
  }
}
