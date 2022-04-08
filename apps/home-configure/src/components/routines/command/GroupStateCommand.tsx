import {
  GroupDTO,
  RoutineCommandGroupStateDTO,
} from '@steggy/controller-shared';
import { Form, Select, Skeleton, Space } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  groups: GroupDTO[];
};

export class GroupStateCommand extends React.Component<
  {
    command?: RoutineCommandGroupStateDTO;
    onUpdate: (command: Partial<RoutineCommandGroupStateDTO>) => void;
  },
  tState
> {
  override state = { groups: [] } as tState;

  private get group(): GroupDTO {
    return this.state.groups.find(
      ({ _id }) => _id === this.props.command?.group,
    );
  }

  override async componentDidMount(): Promise<void> {
    await this.listGroups();
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Group">
          <Select
            value={this.group?._id}
            onChange={group => this.props.onUpdate({ group })}
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
          {this.group ? (
            <Select
              value={this.props.command?.state}
              onChange={state => this.props.onUpdate({ state })}
            >
              {this.group.save_states.map(state => (
                <Select.Option key={state.id} value={state.id}>
                  {state.friendlyName}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <Skeleton.Input active style={{ width: '200px' }} />
          )}
        </Form.Item>
      </Space>
    );
  }

  private async listGroups(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>({
      control: {
        select: [
          'friendlyName',
          'type',
          'save_states.id',
          'save_states.friendlyName',
        ],
        sort: ['type', 'friendlyName'],
      },
      url: `/group`,
    });
    this.setState({ groups });
  }
}
