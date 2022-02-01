import {
  GroupDTO,
  RoutineCommandGroupActionDTO,
} from '@text-based/controller-shared';
import { Divider, Form, Select, Space } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  group: string;
  groups: GroupDTO[];
};

export class GroupActionCommand extends React.Component<
  { command?: RoutineCommandGroupActionDTO },
  tState
> {
  override state = {
    groups: [],
  } as tState;

  override async componentDidMount(): Promise<void> {
    await this.listGroups();
  }

  public getValue(): RoutineCommandGroupActionDTO {
    return this.props.command;
  }

  public load(command: RoutineCommandGroupActionDTO): void {
    // this.setState({
    //   entity_id: command.ref,
    //   extra: command.extra,
    //   state: command.state,
    // });
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item>
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
        <Divider />
        {this.renderPicker()}
      </Space>
    );
  }

  private groupChange(group: string): void {
    this.setState({ group });
  }

  private async listGroups(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>(
      `/group?select=friendlyName,type`,
    );
    this.setState({ groups });
  }

  private renderPicker(): void {
    return undefined;
  }
}
