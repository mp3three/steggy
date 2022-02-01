import {
  GroupDTO,
  RoutineCommandGroupStateDTO,
} from '@text-based/controller-shared';
import { Form, Select, Space } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  group: GroupDTO;
  groups: GroupDTO[];
  state: string;
};

export class GroupStateCommand extends React.Component<
  { command?: RoutineCommandGroupStateDTO },
  tState
> {
  override async componentDidMount(): Promise<void> {
    await this.listGroups();
    const { command } = this.props;
    this.setState({
      group: this.state.groups.find(({ _id }) => _id === command?.group),
      state: command.state,
    });
  }

  public getValue(): RoutineCommandGroupStateDTO {
    return {
      group: this.state.group,
      state: this.state.state,
    };
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Group">
          <Select
            value={this.state.group}
            onChange={this.groupChange.bind(this)}
            showSearch
            style={{ width: '100%' }}
          >
            {this.state.groups.map(group => (
              <Select.Option key={group._id} value={group._id}>
                {group.friendlyName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Save State">
          <Select onChange={state => this.setState({ state })}>
            {this.state.group.save_states.map(state => (
              <Select.Option key={state.id} value={state.id}>
                {state.friendlyName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Space>
    );
  }

  private groupChange(group: string): void {
    this.setState({
      group: this.state.groups.find(({ _id }) => _id === group),
    });
  }

  private async listGroups(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>(
      `/group?select=friendlyName,type,save_states.id,save_states.friendlyName&sort=type,friendlyName`,
    );
    this.setState({ groups });
  }
}
