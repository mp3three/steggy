import {
  GroupDTO,
  RoutineCommandGroupActionDTO,
} from '@steggy/controller-shared';
import { TitleCase } from '@steggy/utilities';
import { Empty, Form, Select, Space } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';
import { LightGroupAction } from '../../groups';

type tState = {
  groups: GroupDTO[];
};

export class GroupActionCommand extends React.Component<
  {
    command?: RoutineCommandGroupActionDTO;
    onUpdate: (command: Partial<RoutineCommandGroupActionDTO>) => void;
  },
  tState
> {
  override state = {
    groups: [],
  } as tState;

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
        <Form.Item>
          <Select
            value={this.group?._id}
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
        {this.renderPicker()}
      </Space>
    );
  }

  private groupChange(group: string): void {
    this.props.onUpdate({
      group,
    });
  }

  private async listGroups(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>({
      control: {
        filters: new Set([{ field: 'type', value: 'light' }]),
        select: ['friendlyName', 'type'],
        sort: ['friendlyName'],
      },
      url: `/group`,
    });
    this.setState({ groups });
  }

  private renderPicker() {
    if (!this.group) {
      return <Empty description="Select group" />;
    }
    if (this.group.type === 'light') {
      return (
        <LightGroupAction
          onUpdate={part => this.props.onUpdate(part)}
          command={
            this.props.command as RoutineCommandGroupActionDTO<{
              brightness: number;
            }>
          }
        />
      );
    }
    return (
      <Empty
        description={`${TitleCase(
          this.group.type,
        )} group does not have special actions`}
      />
    );
  }
}
