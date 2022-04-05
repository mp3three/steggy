import InformationIcon from '@2fd/ant-design-icons/lib/Information';
import { RoutineDTO } from '@automagical/controller-shared';
import { is } from '@automagical/utilities';
import {
  Card,
  Checkbox,
  Divider,
  Select,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

export class RoutineSettings extends React.Component<{
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}> {
  override render() {
    return (
      <Card type="inner">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Checkbox
            checked={this.props.routine.sync}
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
              <InformationIcon />
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
              <InformationIcon />
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
