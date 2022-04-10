import { RoutineCommandNodeRedDTO } from '@steggy/controller-shared';
import { Select, Space, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  targets: Record<'id' | 'name', string>[];
};

export class NodeRedCommand extends React.Component<{
  command?: RoutineCommandNodeRedDTO;
  onUpdate: (command: Partial<RoutineCommandNodeRedDTO>) => void;
}> {
  override state = { targets: [] } as tState;
  override componentDidMount(): void {
    this.refresh();
  }

  override render() {
    return (
      <Space direction="vertical">
        <Select
          style={{ width: '250px' }}
          value={this.props.command?.name}
          onChange={name => this.props.onUpdate({ name })}
        >
          {this.state.targets.map(target => (
            <Select.Option key={target.id} value={target.id}>
              {target.name}
            </Select.Option>
          ))}
        </Select>
        <Typography.Text type="secondary">
          Action associated with node id
        </Typography.Text>
      </Space>
    );
  }

  private async refresh(): Promise<void> {
    const targets = await sendRequest<{
      list: Record<'id' | 'name', string>[];
    }>({
      url: `/debug/node-red/commands`,
    });
    this.setState({ targets: targets.list });
  }
}
