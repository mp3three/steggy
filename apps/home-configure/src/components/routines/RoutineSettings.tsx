import { RoutineDTO } from '@automagical/controller-shared';
import { Card, Checkbox, Divider, Space, Tooltip, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

type tState = {
  name: string;
};

export class RoutineSettings extends React.Component<
  {
    onUpdate: (routine: RoutineDTO) => void;
    routine: RoutineDTO;
  },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <Card type="inner">
        <Space direction="vertical">
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
            <Checkbox
              checked={this.props.routine.sync}
              onChange={({ target }) => this.setSync(target.checked)}
            >
              Synchronous command processing
            </Checkbox>
          </Tooltip>
        </Space>
      </Card>
    );
  }

  private async setSync(sync: boolean) {
    const routine = await sendRequest<RoutineDTO>({
      body: { sync },
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(routine);
  }
}
