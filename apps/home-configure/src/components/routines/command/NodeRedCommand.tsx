import { RoutineCommandNodeRedDTO } from '@steggy/controller-shared';
import { Select } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  targets: string[];
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
      <Select
        style={{ width: '250px' }}
        value={this.props.command?.name}
        onChange={name => this.props.onUpdate({ name })}
      >
        {this.state.targets.map(target => (
          <Select.Option key={target} value={target}>
            {target}
          </Select.Option>
        ))}
      </Select>
    );
  }

  private async refresh(): Promise<void> {
    const targets = await sendRequest<{ list: string[] }>({
      url: `/debug/node-red/commands`,
    });
    this.setState({ targets: targets.list });
  }
}
